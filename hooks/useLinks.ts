// External Imports
import Constants from 'expo-constants';
import * as MailComposer from 'expo-mail-composer';
import { Alert, Linking } from 'react-native';

const { APP_STORE_URL, FEEDBACK_EMAIL, PRIVACY_URL, HELP_URL } =
  Constants.expoConfig?.extra || {};

const openLink = async (url?: string) => {
  if (!url) {
    console.warn('URL is empty or undefined, skipping openLink');
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.warn(`Cannot open URL: ${url}`);
      Alert.alert(
        'Error',
        'Unable to open this link. Please check your settings.',
      );
    }
  } catch (error) {
    console.error(`Failed to open url: ${url}`, error);
    Alert.alert('Error', 'Failed to open link. Please try again.');
  }
};

export const useLinks = () => {
  const rateApp = () => openLink(APP_STORE_URL);

  const shareFeedback = async () => {
    try {
      // Check if email is available
      const isAvailable = await MailComposer.isAvailableAsync();

      if (!isAvailable) {
        // Fallback to mailto if MailComposer not available
        const email = FEEDBACK_EMAIL;
        const subject = 'App Feedback';
        const body = 'Hello, I want to share some feedback...';
        const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        const canOpen = await Linking.canOpenURL(mailtoUrl);
        if (canOpen) {
          await Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            'Email Not Available',
            `Please send your feedback to: ${email}`,
            [
              {
                text: 'Copy Email',
                onPress: () => {
                  // Copy to clipboard would go here
                  Alert.alert('Email', email);
                },
              },
              { text: 'OK' },
            ],
          );
        }
        return;
      }

      // Use MailComposer
      await MailComposer.composeAsync({
        recipients: [FEEDBACK_EMAIL],
        subject: 'App Feedback',
        body: 'Hello, I want to share some feedback...',
      });
    } catch (error) {
      console.error('Error opening email composer:', error);
      Alert.alert('Error', 'Unable to open email. Please try again.');
    }
  };

  const openPrivacy = () => openLink(PRIVACY_URL);
  const openHelp = () => openLink(HELP_URL);

  return { rateApp, shareFeedback, openPrivacy, openHelp };
};
