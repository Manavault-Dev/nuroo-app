import axios from 'axios';
import Constants from 'expo-constants';

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
) => {
  const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;
  const projectId = Constants.expoConfig?.extra?.OPENAI_PROJECT_ID;

  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is missing. Please set it in your .env and app.config.js',
    );
  }

  console.log('🔐 API KEY:', apiKey ? '✅ Found' : '❌ Missing');
  console.log('📦 PROJECT ID:', projectId || 'Not required');
  console.log('👶 Child Data:', childData);
  console.log('🌍 Language:', language);

  const systemPrompt = createSystemPrompt(childData, language);
  const model = 'gpt-4.1-mini';

  try {
    console.log(`🔄 Using model: ${model}`);
    const response = await axios.post(
      API_URL,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
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
    console.log(`✅ Success with model: ${model}`);
    return reply || "Sorry, I couldn't generate a response.";
  } catch (err: any) {
    console.error(
      `❌ Model ${model} failed:`,
      err.response?.data?.error?.message || err.message,
    );
    throw new Error(
      err.response?.data?.error?.message ||
        err.message ||
        'OpenAI API failed. Please check your API access and billing.',
    );
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
) => {
  const languagePrompts = {
    en: `Create a fun, engaging ${area} development activity for a child. 
Make it specific, age-appropriate, and easy for parents to implement at home.
Include: activity name, simple instructions, materials needed, and expected duration.
Respond in English.`,
    ru: `Создайте веселое, увлекательное занятие по развитию ${area} для ребёнка.
Сделайте его конкретным, соответствующим возрасту и простым для родителей в реализации дома.
Включите: название занятия, простые инструкции, необходимые материалы и ожидаемую продолжительность.
Отвечайте на русском языке.`,
  };

  const prompt =
    languagePrompts[language as keyof typeof languagePrompts] ||
    languagePrompts.en;
  return await askNuroo(prompt, childData, language);
};
