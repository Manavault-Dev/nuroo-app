import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (lang: string) => void) => {
    AsyncStorage.getItem('user-language')
      .then((lang) => {
        callback(lang || 'en');
      })
      .catch(() => {
        callback('en');
      });
  },
  init: () => {},
  cacheUserLanguage: (lang: string) => {
    AsyncStorage.setItem('user-language', lang).catch((err) => {
      console.warn('Failed to cache language:', err);
    });
  },
};

try {
  i18n
    .use(languageDetector as any)
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      resources: {
        en: { translation: require('./locales/en.json') },
        ru: { translation: require('./locales/ru.json') },
      },
      interpolation: {
        escapeValue: false,
      },
    })
    .catch((error) => {
      console.error('❌ i18n initialization failed:', error);
      // Set to English as fallback
      i18n.changeLanguage('en').catch(() => {});
    });
} catch (error) {
  console.error('❌ Critical i18n error:', error);
}

export default i18n;
