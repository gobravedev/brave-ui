import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import zh from "./locales/zh.json";
const storedLocale = localStorage.getItem('locale'); // 从 localStorage 读取

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: storedLocale === 'zh_CN' ? 'zh' : 'en', // 默认语言
  fallbackLng: "zh",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
