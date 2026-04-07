import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en';

const resources = {
  en: { translation: en },
};

const deviceLang = Localization.getLocales()?.[0]?.languageCode ?? 'en';
const supportedLangs = Object.keys(resources);
const fallbackLng = 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: supportedLangs.includes(deviceLang) ? deviceLang : fallbackLng,
    fallbackLng,
    interpolation: { escapeValue: false },
    compatibilityJSON: 'v4',
  });

export default i18n;
