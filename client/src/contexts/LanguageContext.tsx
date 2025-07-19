import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Translation, getTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translation;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('thar-dairy-language');
    return (saved as Language) || 'en';
  });

  const [t, setTranslation] = useState<Translation>(getTranslation(language));
  const isRTL = language === 'sd';

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setTranslation(getTranslation(lang));
    localStorage.setItem('thar-dairy-language', lang);
    
    // Update document direction and language
    document.documentElement.dir = lang === 'sd' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Set initial direction and language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isRTL,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};