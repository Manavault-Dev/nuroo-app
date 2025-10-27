// External Imports
import axios from 'axios';
import Constants from 'expo-constants';

// Internal Imports
import { ErrorHandlingService } from '@/lib/services/errorHandlingService';
import { RateLimitService } from '@/lib/services/rateLimitService';
import { InputSanitizer } from '@/lib/utils/sanitization';

const API_URL = 'https://api.openai.com/v1/chat/completions';

const createSystemPrompt = (
  childData?: {
    name?: string;
    age?: string;
    diagnosis?: string;
    developmentAreas?: string[];
  },
  language: string = 'en',
) => {
  const languageInstructions = {
    en: {
      role: 'You are Nuroo, a specialized AI assistant for parents of neurodivergent children.',
      guidelines: [
        'Always be encouraging and positive',
        'Provide specific, actionable suggestions',
        "Consider the child's unique needs",
        'Suggest activities that are fun and engaging',
        'Keep responses concise but helpful',
        'Use simple language that parents can understand',
      ],
      response: 'Respond as a supportive child development expert in English.',
    },
    ru: {
      role: 'Вы - Nuroo, специализированный ИИ-помощник для родителей нейроразнообразных детей.',
      guidelines: [
        'Всегда будьте ободряющими и позитивными',
        'Предоставляйте конкретные, практичные предложения',
        'Учитывайте уникальные потребности ребёнка',
        'Предлагайте занятия, которые веселые и увлекательные',
        'Держите ответы краткими, но полезными',
        'Используйте простой язык, понятный родителям',
      ],
      response:
        'Отвечайте как поддерживающий эксперт по развитию детей на русском языке.',
    },
  };

  const currentLang =
    languageInstructions[language as keyof typeof languageInstructions] ||
    languageInstructions.en;

  let prompt = `${currentLang.role}
Ваша роль - предоставлять поддерживающие, практические советы и создавать персонализированные занятия.

Руководящие принципы:
${currentLang.guidelines.map((guideline) => `- ${guideline}`).join('\n')}

`;

  if (childData?.name && childData?.age) {
    prompt += `Ребёнок: ${childData.name}, Возраст: ${childData.age}\n`;
  }

  if (childData?.diagnosis) {
    prompt += `Диагноз: ${childData.diagnosis}\n`;
  }

  if (childData?.developmentAreas && childData.developmentAreas.length > 0) {
    prompt += `Области фокуса: ${childData.developmentAreas.join(', ')}\n`;
  }

  prompt += `\n${currentLang.response}`;

  return prompt;
};

export const askNuroo = async (
  message: string,
  childData?: {
    name?: string;
    age?: string;
    diagnosis?: string;
    developmentAreas?: string[];
  },
  language: string = 'en',
  userId?: string,
) => {
  if (userId) {
    const rateLimitResult = await RateLimitService.checkRateLimit(
      userId,
      'openai_ask',
    );
    if (!rateLimitResult.allowed) {
      throw new Error(
        `Rate limit exceeded. Please try again in ${RateLimitService.formatTimeUntilReset(rateLimitResult.resetTime)}`,
      );
    }
  }

  const sanitizedMessage = InputSanitizer.sanitizePrompt(message);
  const sanitizedLanguage = InputSanitizer.sanitizeText(language, {
    maxLength: 10,
  });

  if (!sanitizedMessage || sanitizedMessage.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (InputSanitizer.containsMaliciousContent(message)) {
    throw new Error('Message contains potentially harmful content');
  }

  let sanitizedChildData = childData;
  if (childData) {
    sanitizedChildData = {
      name: childData.name
        ? InputSanitizer.sanitizeName(childData.name)
        : undefined,
      age: childData.age
        ? InputSanitizer.sanitizeText(childData.age, { maxLength: 10 })
        : undefined,
      diagnosis: childData.diagnosis
        ? InputSanitizer.sanitizeMedicalInfo(childData.diagnosis)
        : undefined,
      developmentAreas: childData.developmentAreas?.map((area) =>
        InputSanitizer.sanitizeText(area, { maxLength: 100 }),
      ),
    };
  }

  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY;
  const projectId = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_PROJECT_ID;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing. Please set it in your .env and app.config.js',
    );
  }

  const systemPrompt = createSystemPrompt(
    sanitizedChildData,
    sanitizedLanguage,
  );
  const model = 'gpt-4.1-mini';

  try {
    const response = await axios.post(
      API_URL,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: sanitizedMessage },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          ...(projectId && { 'OpenAI-Project': projectId }),
        },
        timeout: 30000,
      },
    );

    const reply = response.data.choices[0]?.message?.content?.trim();

    return reply || "Sorry, I couldn't generate a response.";
  } catch (err: any) {
    console.error(
      `❌ Model ${model} failed:`,
      err.response?.data?.error?.message || err.message,
    );

    const errorHandling = await ErrorHandlingService.handleOpenAIError(err, {
      component: 'askNuroo',
      action: 'openai_api_call',
      userId,
      additionalData: {
        model,
        messageLength: sanitizedMessage.length,
        hasChildData: !!sanitizedChildData,
      },
    });

    throw new Error(errorHandling.message);
  }
};

export const generateDevelopmentTask = async (
  area: string,
  childData?: {
    name?: string;
    age?: string;
    diagnosis?: string;
  },
  language: string = 'en',
  userId?: string,
) => {
  if (userId) {
    const rateLimitResult = await RateLimitService.checkRateLimit(
      userId,
      'openai_tasks',
    );
    if (!rateLimitResult.allowed) {
      throw new Error(
        `Daily task generation limit reached. Please try again tomorrow.`,
      );
    }
  }

  const sanitizedArea = InputSanitizer.sanitizeText(area, { maxLength: 100 });
  const sanitizedLanguage = InputSanitizer.sanitizeText(language, {
    maxLength: 10,
  });

  if (!sanitizedArea || sanitizedArea.length === 0) {
    throw new Error('Development area cannot be empty');
  }

  let sanitizedChildData = childData;
  if (childData) {
    sanitizedChildData = {
      name: childData.name
        ? InputSanitizer.sanitizeName(childData.name)
        : undefined,
      age: childData.age
        ? InputSanitizer.sanitizeText(childData.age, { maxLength: 10 })
        : undefined,
      diagnosis: childData.diagnosis
        ? InputSanitizer.sanitizeMedicalInfo(childData.diagnosis)
        : undefined,
    };
  }

  const languagePrompts = {
    en: `Create a fun, engaging ${sanitizedArea} development activity for a child. 
Make it specific, age-appropriate, and easy for parents to implement at home.
Include: activity name, simple instructions, materials needed, and expected duration.
Respond in English.`,
    ru: `Создайте веселое, увлекательное занятие по развитию ${sanitizedArea} для ребёнка.
Сделайте его конкретным, соответствующим возрасту и простым для родителей в реализации дома.
Включите: название занятия, простые инструкции, необходимые материалы и ожидаемую продолжительность.
Отвечайте на русском языке.`,
  };

  const prompt =
    languagePrompts[sanitizedLanguage as keyof typeof languagePrompts] ||
    languagePrompts.en;
  return await askNuroo(prompt, sanitizedChildData, sanitizedLanguage);
};
