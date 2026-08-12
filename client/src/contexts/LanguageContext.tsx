import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export const SUPPORTED_LOCALES = ["ko", "en", "ja"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

type LanguageContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
};

const LANGUAGE_STORAGE_KEY = "mind-check-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);

function readStoredLocale(): SupportedLocale {
  if (typeof window === "undefined") return "ko";
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return SUPPORTED_LOCALES.includes(stored as SupportedLocale)
    ? (stored as SupportedLocale)
    : "ko";
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<SupportedLocale>(readStoredLocale);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }
  return context;
}
