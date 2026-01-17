import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import kn from './locales/kn.json';
import ta from './locales/ta.json';
import mr from './locales/mr.json';
import ml from './locales/ml.json';
import bn from './locales/bn.json';
import gu from './locales/gu.json';
import pa from './locales/pa.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te },
    kn: { translation: kn },
    ta: { translation: ta },
    mr: { translation: mr },
    ml: { translation: ml },
    bn: { translation: bn },
    gu: { translation: gu },
    pa: { translation: pa },
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        lng: localStorage.getItem('language') || 'en',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;
