import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: (callback: (lang: string) => void) => {
    AsyncStorage.getItem('user-language').then((lang) => {
      callback(lang || 'en');
    });
  },
  init: () => {},
  cacheUserLanguage: (lang: string) => {
    AsyncStorage.setItem('user-language', lang);
  },
};

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
  });

export default i18n;
