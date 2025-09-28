import i18n from '@/i18n/i18n';
import { generateDevelopmentTask } from '@/lib/api/openai';
import { db } from '@/lib/firebase/firebase';
import {
  ChildData,
  DailyTaskSet,
  Task,
  UserProgress,
} from '@/lib/home/home.types';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ProgressService } from './progressService';

export class TaskGenerationService {
  static async generatePersonalizedTasks(
    userId: string,
    childData: ChildData,
    language: string = 'en',
  ): Promise<Task[]> {
    try {
      const progress = await ProgressService.getProgress(userId);
      if (!progress) {
        await ProgressService.initializeProgress(userId);
        const newProgress = await ProgressService.getProgress(userId);
        if (!newProgress) {
          throw new Error('Failed to initialize progress');
        }
        return this.generatePersonalizedTasks(userId, childData, language);
      }

      const difficulties =
        ProgressService.getPersonalizedDifficulties(progress);

      const tasks: Task[] = [];
      const developmentAreas = childData.developmentAreas || [];

      if (developmentAreas.length === 0) {
        throw new Error('No development areas specified');
      }

      const maxTasks = 4;
      const areasToUse = developmentAreas.slice(0, maxTasks);

      const areasForTasks = [];
      for (let i = 0; i < maxTasks; i++) {
        areasForTasks.push(areasToUse[i % areasToUse.length]);
      }

      for (let i = 0; i < maxTasks; i++) {
        const area = areasForTasks[i];
        const areaProgress = this.getAreaProgress(area, progress);
        const difficulty = difficulties[this.mapAreaToProgressKey(area)];

        try {
          console.log(
            `🎯 Generating task ${i + 1}/4 for ${area} (${difficulty} level) in ${language}`,
          );

          const prompt = this.createPersonalizedPrompt(
            area,
            areaProgress,
            difficulty,
            childData,
            language,
          );
          const taskDescription = await generateDevelopmentTask(
            prompt,
            childData,
            language,
          );

          const task = this.parseTaskFromAI(
            area,
            taskDescription,
            i + 1,
            difficulty,
            areaProgress,
            language,
          );
          tasks.push(task);

          console.log(
            `✅ Task ${i + 1}/4 generated for ${area} in ${language}:`,
            task.title,
          );
        } catch (error: any) {
          console.error(
            `❌ Error generating task ${i + 1}/4 for ${area}:`,
            error,
          );
        }
      }

      console.log(
        `🎉 Generated ${tasks.length}/4 personalized tasks in ${language}`,
      );
      return tasks;
    } catch (error) {
      console.error('❌ Error in generatePersonalizedTasks:', error);
      throw error;
    }
  }

  static async checkAndGenerateDailyTasks(
    userId: string,
    childData: ChildData,
    language: string = 'en',
  ): Promise<boolean> {
    try {
      const shouldGenerate = await ProgressService.shouldGenerateTasks(userId);

      if (!shouldGenerate) {
        return false;
      }

      const tasks = await this.generatePersonalizedTasks(
        userId,
        childData,
        language,
      );

      await this.storeDailyTasks(userId, tasks, childData);

      await ProgressService.updateLastTaskDate(userId);

      return true;
    } catch (error) {
      console.error('❌ Error checking/generating daily tasks:', error);
      return false;
    }
  }

  private static async storeDailyTasks(
    userId: string,
    tasks: Task[],
    childData: ChildData,
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const progress = await ProgressService.getProgress(userId);

      const dailyTaskSet: DailyTaskSet = {
        id: `daily-${userId}-${today}`,
        userId,
        date: today,
        tasks,
        generatedAt: new Date(),
        progressSnapshot: progress || {
          communication: 25,
          motor_skills: 25,
          social: 25,
          cognitive: 25,
          sensory: 25,
          behavior: 25,
        },
      };

      await setDoc(doc(db, 'dailyTasks', dailyTaskSet.id), dailyTaskSet);

      for (const task of tasks) {
        const taskRef = doc(collection(db, 'tasks'));
        const taskData = {
          ...task,
          id: taskRef.id,
          userId,
          dailyId: today,
          createdAt: new Date(),

          title: task.title,
          description: task.description,
          category: task.category,
          time: task.time,
          emoji: task.emoji,
          completed: false,
          developmentArea: task.developmentArea,
          difficulty: task.difficulty,
          estimatedDuration: task.estimatedDuration,
        };

        await setDoc(taskRef, taskData);
      }
    } catch (error) {
      console.error('❌ Error storing daily tasks:', error);
      throw error;
    }
  }

  private static createPersonalizedPrompt(
    area: string,
    progress: number,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    childData: ChildData,
    language: string = 'en',
  ): string {
    const difficultyKey = difficulty as keyof typeof i18n.t;
    const difficultyText = i18n.t(`tasks.difficulty.${difficultyKey}`, {
      lng: language,
    });

    const progressDescription =
      progress < 30
        ? i18n.t('tasks.progress_levels.early_stages', { lng: language })
        : progress < 70
          ? i18n.t('tasks.progress_levels.developing_well', { lng: language })
          : i18n.t('tasks.progress_levels.advanced_level', { lng: language });

    const areaTranslations = {
      en: {
        speech: 'speech',
        language: 'language',
        social: 'social',
        motor: 'motor',
        cognitive: 'cognitive',
        sensory: 'sensory',
        behavior: 'behavior',
      },
      ru: {
        speech: 'речи',
        language: 'языка',
        social: 'социальных навыков',
        motor: 'моторных навыков',
        cognitive: 'когнитивных способностей',
        sensory: 'сенсорной обработки',
        behavior: 'поведения',
      },
    };

    const currentAreaTranslations =
      areaTranslations[language as keyof typeof areaTranslations] ||
      areaTranslations.en;
    const translatedArea =
      currentAreaTranslations[
        area.toLowerCase() as keyof typeof currentAreaTranslations
      ] || area;

    const languagePrompts = {
      en: `Create a ${difficultyText} ${translatedArea} development activity for a child who is in the ${progressDescription} of their development journey.

Child Information:
- Name: {name}
- Age: {age}
- Diagnosis: {diagnosis}
- Current ${translatedArea} level: {progress}/100 (${difficultyText})

Requirements:
- Make it ${difficultyText}
- Include clear, step-by-step instructions
- Suggest materials that are easily available at home
- Estimated duration: 10-20 minutes
- Make it fun and engaging
- Consider the child's current abilities and gently push them forward

Format the response as a clear, actionable task description in English.`,
      ru: `Создайте ${difficultyText} занятие по развитию ${translatedArea} для ребёнка, который находится на ${progressDescription} своего пути развития.

Информация о ребёнке:
- Имя: {name}
- Возраст: {age}
- Диагноз: {diagnosis}
- Текущий уровень ${translatedArea}: {progress}/100 (${difficultyText})

Требования:
- Сделайте его ${difficultyText}
- Включите чёткие пошаговые инструкции
- Предложите материалы, которые легко доступны дома
- Ожидаемая продолжительность: 10-20 минут
- Сделайте его весёлым и увлекательным
- Учитывайте текущие способности ребёнка и мягко подталкивайте их вперёд

Оформите ответ как чёткое, практичное описание задачи на русском языке.`,
    };

    const currentLang =
      languagePrompts[language as keyof typeof languagePrompts] ||
      languagePrompts.en;

    return currentLang
      .replace('{name}', childData.name || 'Child')
      .replace('{age}', childData.age || 'Unknown')
      .replace('{diagnosis}', childData.diagnosis || 'Not specified')
      .replace('{progress}', progress.toString());
  }

  private static parseTaskFromAI(
    area: string,
    aiResponse: string,
    taskNumber: number,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    areaProgress: number,
    language: string = 'en',
  ): Task {
    const emojis = ['🌅', '😊', '🧱', '🎨', '🎵', '📚'];
    const emoji = emojis[taskNumber - 1] || '✨';

    const lines = aiResponse.split('\n');
    let title = lines[0] || `Daily ${area} Activity`;

    title = title.replace(/^[#*•\s]+/, '').trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    const dailyId = new Date().toISOString().split('T')[0];

    const categoryTranslations = {
      en: {
        speech: 'Speech Development',
        language: 'Language Development',
        social: 'Social Development',
        motor: 'Motor Development',
        cognitive: 'Cognitive Development',
        sensory: 'Sensory Development',
        behavior: 'Behavior Development',
      },
      ru: {
        speech: 'Развитие речи',
        language: 'Развитие языка',
        social: 'Социальное развитие',
        motor: 'Моторное развитие',
        cognitive: 'Когнитивное развитие',
        sensory: 'Сенсорное развитие',
        behavior: 'Развитие поведения',
      },
    };

    const currentCategoryTranslations =
      categoryTranslations[language as keyof typeof categoryTranslations] ||
      categoryTranslations.en;
    const translatedCategory =
      currentCategoryTranslations[
        area.toLowerCase() as keyof typeof currentCategoryTranslations
      ] || `${area.charAt(0).toUpperCase() + area.slice(1)} Development`;

    const timeTranslations = {
      en: '10-15 min',
      ru: '10-15 мин',
    };

    return {
      id: `task-${Date.now()}-${taskNumber}`,
      title,
      description: aiResponse,
      category: translatedCategory,
      time:
        timeTranslations[language as keyof typeof timeTranslations] ||
        timeTranslations.en,
      emoji,
      completed: false,
      createdAt: new Date(),
      developmentArea: area,
      dailyId,
      difficulty,
      estimatedDuration: 15,
    };
  }

  private static getAreaProgress(area: string, progress: UserProgress): number {
    const areaMap: Record<string, keyof UserProgress> = {
      speech: 'communication',
      language: 'communication',
      social: 'social',
      motor: 'motor_skills',
      cognitive: 'cognitive',
      sensory: 'sensory',
      behavior: 'behavior',
    };

    const progressKey = areaMap[area.toLowerCase()] || 'communication';
    return progress[progressKey];
  }

  private static mapAreaToProgressKey(area: string): keyof UserProgress {
    const areaMap: Record<string, keyof UserProgress> = {
      speech: 'communication',
      language: 'communication',
      social: 'social',
      motor: 'motor_skills',
      cognitive: 'cognitive',
      sensory: 'sensory',
      behavior: 'behavior',
    };

    return areaMap[area.toLowerCase()] || 'communication';
  }
}
