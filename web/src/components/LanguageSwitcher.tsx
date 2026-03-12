import { Locale, LocaleContext } from "@businessnjgovnavigator/shared/contexts/localeContext";
import { ReactElement, useContext } from "react";

const localeLabels: Record<Locale, string> = {
  en: "English",
  "es-LA": "Español",
};

export const LanguageSwitcher = (): ReactElement => {
  const { locale, setLocale } = useContext(LocaleContext);
  const nextLocale: Locale = locale === "en" ? "es-LA" : "en";

  return (
    <button
      onClick={() => setLocale(nextLocale)}
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "1.5rem",
        zIndex: 9999,
        padding: "0.75rem 1.25rem",
        backgroundColor: "#1b1b1b",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "0.875rem",
        fontWeight: 600,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.25)",
      }}
      aria-label={`Switch language to ${localeLabels[nextLocale]}`}
    >
      {localeLabels[nextLocale]}
    </button>
  );
};
