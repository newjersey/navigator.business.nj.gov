/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConfigType } from "@/contexts/configContext";
import { profileFieldsFromConfig } from "@/lib/types/types";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { merge } from "lodash";

type FieldContent = {
  default: any;
  overrides?: {
    STARTING?: any;
    OWNING?: any;
    FOREIGN?: any;
  };
};

interface ProfileFieldContent extends FieldContent {
  onboarding: FieldContent;
}

export const getProfileConfig = (props: {
  config: ConfigType;
  fieldName: keyof typeof profileFieldsFromConfig;
  onboarding?: boolean;
  persona?: BusinessPersona;
}): any => {
  const configForField: ProfileFieldContent = (props.config.profileDefaults as any)["fields"][
    props.fieldName
  ];

  let mergedConfig = configForField.default;

  if (props.persona && configForField.overrides) {
    mergedConfig = merge(mergedConfig, configForField.overrides[props.persona]);
  }

  if (props.onboarding && configForField.onboarding?.default) {
    mergedConfig = merge(mergedConfig, configForField.onboarding?.default);

    if (props.persona && configForField.onboarding?.overrides) {
      mergedConfig = merge(mergedConfig, configForField.onboarding.overrides[props.persona]);
    }
  }

  return mergedConfig;
};
