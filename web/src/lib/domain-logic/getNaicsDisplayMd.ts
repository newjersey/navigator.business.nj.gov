import { getMergedConfig } from "@/contexts/configContext";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";

export const getNaicsDisplayMd = (naicsCode: string): string => {
  const Config = getMergedConfig();
  let displayMd = Config.determineNaicsCode.missingNAICSCodePlaceholder;
  if (naicsCode) {
    const naicsCodeObj = lookupNaicsCode(naicsCode);
    displayMd = naicsCodeObj
      ? `**${naicsCodeObj.SixDigitCode}** - ${naicsCodeObj.SixDigitDescription}`
      : `${naicsCode} - Unknown Code`;
  }

  return displayMd;
};
