"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { vi } from "../translations/vi";
import { en } from "../translations/en";

type Language = "vi" | "en";
type TranslationType = typeof vi;

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("rubik-language") as Language;
      if (savedLang === "vi" || savedLang === "en") {
        setLanguageState(savedLang);
      } else {
        const browserLang = navigator.language.startsWith("vi") ? "vi" : "en";
        setLanguageState(browserLang);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("rubik-language", lang);
    }
  };

  const t = language === "vi" ? vi : en;

  // Render a fallback or matching initial state to prevent hydration flash issues
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
