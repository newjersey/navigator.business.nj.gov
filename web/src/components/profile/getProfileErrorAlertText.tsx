import { getMergedConfig } from "@/contexts/configContext";
import { templateEval } from "@/lib/utils/helpers";

export const getProfileErrorAlertText = (numOfErrors: number): string => {
  const Config = getMergedConfig();

  const fieldText =
    numOfErrors === 1
      ? Config.profileDefaults.default.errorErrorAlertOneField
      : Config.profileDefaults.default.errorAlertMultipleFields;

  return templateEval(Config.profileDefaults.default.errorTextBody, {
    fieldText,
  });
};
