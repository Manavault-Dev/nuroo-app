import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'https://api.openai.com/v1/chat/completions';

const createSystemPrompt = (childData?: {
  name?: string;
  age?: string;
  diagnosis?: string;
  developmentAreas?: string[];
}) => {
  let prompt = `You are Nuroo, a specialized AI assistant for parents of neurodivergent children. 
Your role is to provide supportive, practical advice and create personalized activities.\n\nGuidelines:\n- Always be encouraging and positive\n- Provide specific, actionable suggestions\n- Consider the child's unique needs\n- Suggest activities that are fun and engaging\n- Keep responses concise but helpful\n- Use simple language that parents can understand\n\n`;

  if (childData?.name && childData?.age) {
    prompt += `Child: ${childData.name}, Age: ${childData.age}\n`;
  }

  if (childData?.diagnosis) {
    prompt += `Diagnosis: ${childData.diagnosis}\n`;
  }

  if (childData?.developmentAreas && childData.developmentAreas.length > 0) {
    prompt += `Focus Areas: ${childData.developmentAreas.join(', ')}\n`;
  }

  prompt += `\nRespond as a supportive child development expert.`;

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

  const systemPrompt = createSystemPrompt(childData);

  const models = ['gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'];
  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`🔄 Trying model: ${model}`);
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
      lastError = err;
      console.log(
        `❌ Model ${model} failed:`,
        err.response?.data?.error?.message || err.message,
      );
      continue;
    }
  }

  throw new Error(
    lastError?.response?.data?.error?.message ||
      lastError?.message ||
      'All OpenAI models failed. Please check your API access and billing.',
  );
};

export const generateDevelopmentTask = async (
  area: string,
  childData?: {
    name?: string;
    age?: string;
    diagnosis?: string;
  },
) => {
  const prompt = `Create a fun, engaging ${area} development activity for a child. 
Make it specific, age-appropriate, and easy for parents to implement at home.
Include: activity name, simple instructions, materials needed, and expected duration.`;

  return await askNuroo(prompt, childData);
};
