// frontend/src/hooks/useLanguage.ts
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const { t, i18n } = useTranslation();

  const changeLanguage = (language: 'pt-BR' | 'en-US') => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const getCurrentLanguage = () => i18n.language;

  return {
    t,
    changeLanguage,
    getCurrentLanguage
  };
};