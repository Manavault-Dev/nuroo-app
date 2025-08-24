import {
  ChildData,
  DailyTaskSet,
  Task,
  UserProgress,
} from '@/app/(tabs)/home/home.types';
import { generateDevelopmentTask } from '@/lib/api/openai';
import { db } from '@/lib/firebase/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { ProgressService } from './progressService';

export class TaskGenerationService {
  /**
   * Generate personalized tasks based on user progress
   */
  static async generatePersonalizedTasks(
    userId: string,
    childData: ChildData,
  ): Promise<Task[]> {
    try {
      console.log('🚀 Starting personalized task generation...');

      const progress = await ProgressService.getProgress(userId);
      if (!progress) {
        console.log('📊 No progress found, initializing...');
        await ProgressService.initializeProgress(userId);
        const newProgress = await ProgressService.getProgress(userId);
        if (!newProgress) {
          throw new Error('Failed to initialize progress');
        }
        return this.generatePersonalizedTasks(userId, childData);
      }

      console.log('📊 Current progress:', progress);

      const difficulties =
        ProgressService.getPersonalizedDifficulties(progress);
      console.log('🎯 Personalized difficulties:', difficulties);

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
            `🎯 Generating task ${i + 1}/4 for ${area} (${difficulty} level)`,
          );

          const prompt = this.createPersonalizedPrompt(
            area,
            areaProgress,
            difficulty,
            childData,
          );
          const taskDescription = await generateDevelopmentTask(
            prompt,
            childData,
          );

          const task = this.parseTaskFromAI(
            area,
            taskDescription,
            i + 1,
            difficulty,
            areaProgress,
          );
          tasks.push(task);

          console.log(`✅ Task ${i + 1}/4 generated for ${area}:`, task.title);
        } catch (error: any) {
          console.error(
            `❌ Error generating task ${i + 1}/4 for ${area}:`,
            error,
          );
        }
      }

      console.log(`🎉 Generated ${tasks.length}/4 personalized tasks`);
      return tasks;
    } catch (error) {
      console.error('❌ Error in generatePersonalizedTasks:', error);
      throw error;
    }
  }

  /**
   * Check and generate daily tasks if needed
   */
  static async checkAndGenerateDailyTasks(
    userId: string,
    childData: ChildData,
  ): Promise<boolean> {
    try {
      const shouldGenerate = await ProgressService.shouldGenerateTasks(userId);

      if (!shouldGenerate) {
        console.log('📅 Tasks already generated for today');
        return false;
      }

      console.log('🆕 Generating new daily tasks...');

      // Generate tasks
      const tasks = await this.generatePersonalizedTasks(userId, childData);

      // Store tasks in daily collection
      await this.storeDailyTasks(userId, tasks, childData);

      // Update last task date
      await ProgressService.updateLastTaskDate(userId);

      console.log('✅ Daily tasks generated and stored successfully');
      return true;
    } catch (error) {
      console.error('❌ Error checking/generating daily tasks:', error);
      return false;
    }
  }

  /**
   * Store daily tasks in Firestore
   */
  private static async storeDailyTasks(
    userId: string,
    tasks: Task[],
    childData: ChildData,
  ): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const progress = await ProgressService.getProgress(userId);

      // Create daily task set
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

      // Store in daily collection
      await setDoc(doc(db, 'dailyTasks', dailyTaskSet.id), dailyTaskSet);

      // Store individual tasks in tasks collection with proper structure
      for (const task of tasks) {
        const taskRef = doc(collection(db, 'tasks'));
        const taskData = {
          ...task,
          id: taskRef.id,
          userId,
          dailyId: today,
          createdAt: new Date(),
          // Ensure all required fields are present
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
        console.log(`💾 Task stored: ${task.title}`);
      }

      console.log('💾 Daily tasks stored successfully');
    } catch (error) {
      console.error('❌ Error storing daily tasks:', error);
      throw error;
    }
  }

  /**
   * Create personalized prompt based on progress and difficulty
   */
  private static createPersonalizedPrompt(
    area: string,
    progress: number,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    childData: ChildData,
  ): string {
    const difficultyDescriptions = {
      beginner: 'slightly challenging but achievable',
      intermediate: 'moderately challenging to help growth',
      advanced: 'challenging to push current limits',
    };

    const progressDescription =
      progress < 30
        ? 'early stages'
        : progress < 70
          ? 'developing well'
          : 'advanced level';

    return `Create a ${difficultyDescriptions[difficulty]} ${area} development activity for a child who is in the ${progressDescription} of their development journey.

Child Information:
- Name: ${childData.name || 'Child'}
- Age: ${childData.age || 'Unknown'}
- Diagnosis: ${childData.diagnosis || 'Not specified'}
- Current ${area} level: ${progress}/100 (${difficulty})

Requirements:
- Make it ${difficultyDescriptions[difficulty]}
- Include clear, step-by-step instructions
- Suggest materials that are easily available at home
- Estimated duration: 10-20 minutes
- Make it fun and engaging
- Consider the child's current abilities and gently push them forward

Format the response as a clear, actionable task description.`;
  }

  /**
   * Parse AI response into structured task
   */
  private static parseTaskFromAI(
    area: string,
    aiResponse: string,
    taskNumber: number,
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    areaProgress: number,
  ): Task {
    const emojis = ['🌅', '😊', '🧱', '🎨', '🎵', '📚'];
    const emoji = emojis[taskNumber - 1] || '✨';

    const lines = aiResponse.split('\n');
    let title = lines[0] || `Daily ${area} Activity`;

    title = title.replace(/^[#*•\s]+/, '').trim();
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }

    // Use consistent ISO date format for dailyId
    const dailyId = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    return {
      id: `task-${Date.now()}-${taskNumber}`,
      title,
      description: aiResponse,
      category: `${area.charAt(0).toUpperCase() + area.slice(1)} Development`,
      time: '10-15 min',
      emoji,
      completed: false,
      createdAt: new Date(),
      developmentArea: area,
      dailyId, // Use consistent format
      difficulty,
      estimatedDuration: 15,
    };
  }

  /**
   * Get progress value for a specific area
   */
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

  /**
   * Map development area to progress key
   */
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
