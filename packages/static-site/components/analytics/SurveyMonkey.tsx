"use client";

import Script from "next/script";

const SURVEY_MONKEY_SCRIPT_SRC =
  "https://widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgd_2Fl0hAvWCD8cNdKnWc8kt0IafoTskhMiZ5h9m_2FJavuow.js";

const TABLET_AND_UP_QUERY = "(min-width: 40em)";

const isEnabled = (): boolean =>
  // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
  process.env.NEXT_PUBLIC_SURVEY_MONKEY_ENABLED === "true";

// SurveyMonkey's own layout does not adapt to small screens, so
// we just skip rendering below the tablet breakpoint.
const isTabletAndUp = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(TABLET_AND_UP_QUERY).matches;

export const SurveyMonkey = () => {
  if (!isEnabled() || !isTabletAndUp()) {
    return null;
  }

  return <Script id="smcx-sdk" src={SURVEY_MONKEY_SCRIPT_SRC} strategy="afterInteractive" />;
};
