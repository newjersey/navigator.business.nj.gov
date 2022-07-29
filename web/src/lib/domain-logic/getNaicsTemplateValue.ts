import { getMergedConfig } from "@/contexts/configContext";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";
import { templateEval } from "@/lib/utils/helpers";

export const getNaicsTemplateValue = (naicsCode: string): string => {
  const Config = getMergedConfig();
  let naicsTemplateValue = Config.determineNaicsCode.registerForTaxesMissingNAICSCodePlaceholder;
  if (naicsCode) {
    const naicsCodeObj = lookupNaicsCode(naicsCode);
    const naicsCodeDisplayValue = naicsCodeObj
      ? `${naicsCodeObj.SixDigitCode} - ${naicsCodeObj.SixDigitDescription}`
      : `${naicsCode} - Unknown Code`;
    naicsTemplateValue = templateEval(Config.determineNaicsCode.registerForTaxesNAICSCodePlaceholder, {
      naicsCode: naicsCodeDisplayValue,
    });
  }

  return naicsTemplateValue;
};
