/**
 * i18next setup: English + Tamil, localStorage persistence, English fallback.
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ta from './locales/ta.json';

export const LANGUAGE_STORAGE_KEY = 'pos-ui-language';

function getInitialLanguage() {
  if (typeof localStorage === 'undefined') {
    return 'en';
  }
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved === 'ta' || saved === 'en' ? saved : 'en';
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ta: { translation: ta },
  },
  lng: getInitialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/**
 * Switches UI language and saves preference for the next visit.
 * @param {string} lng — "en" | "ta"
 */
export function changeAppLanguage(lng) {
  if (lng !== 'en' && lng !== 'ta') {
    return;
  }
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  void i18n.changeLanguage(lng);
}

/** BCP 47 locale for dates and numbers in the UI. */
export function getAppLocale() {
  return i18n.language?.startsWith('ta') ? 'ta-IN' : 'en-IN';
}

export default i18n;
