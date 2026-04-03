import { createContext } from "react";

export type Locale = "en" | "es-LA";

export interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextType>({
  locale: "en",
  setLocale: () => {},
});
