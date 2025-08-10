import { Linking } from 'react-native';
import Constants from 'expo-constants';

const { APP_STORE_URL, FEEDBACK_EMAIL, HELP_URL, PRIVACY_URL } =
  Constants.expoConfig?.extra ?? {};

const openLink = async (url?: string) => {
  if (!url) {
    console.warn('URL is empty or undefined, skipping openLink');
    return;
  }
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error(`Failed to open url: ${url}`, error);
  }
};

export const useLinks = () => {
  const rateApp = () => openLink(APP_STORE_URL);
  const shareFeedback = () => {
    const email = FEEDBACK_EMAIL;
    const subject = 'App Feedback';
    const body = 'Hello, I want to share some feedback...';
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    openLink(mailtoUrl);
  };

  const openPrivacy = () => openLink(PRIVACY_URL);
  const openHelp = () => openLink(HELP_URL);

  return { rateApp, shareFeedback, openPrivacy, openHelp };
};
