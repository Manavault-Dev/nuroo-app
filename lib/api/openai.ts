import axios from 'axios';
import Constants from 'expo-constants';

const API_URL = 'https://api.openai.com/v1/chat/completions';

export const askNuroo = async (message: string) => {
  const apiKey = Constants.expoConfig?.extra?.OPENAI_API_KEY;
  const projectId = Constants.expoConfig?.extra?.OPENAI_PROJECT_ID;

  console.log('🔐 API KEY:', apiKey);
  console.log('📦 PROJECT ID:', projectId);

  try {
    const response = await axios.post(
      API_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'OpenAI-Project': projectId,
        },
      },
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Sorry, something went wrong.';
  }
};
