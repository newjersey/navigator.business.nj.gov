/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { getProfileFieldsFromConfig } from "@businessnjgovnavigator/shared/types";
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
  fieldName: keyof ReturnType<typeof getProfileFieldsFromConfig>;
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
