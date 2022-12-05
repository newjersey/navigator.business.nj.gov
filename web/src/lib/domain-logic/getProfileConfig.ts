/* eslint-disable @typescript-eslint/no-explicit-any */

import { ConfigType } from "@/contexts/configContext";
import { profileFieldsFromConfig } from "@/lib/types/types";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { merge } from "lodash";

type ProfileFieldContent = {
  default: any;
  overrides?: {
    STARTING?: any;
    OWNING?: any;
    FOREIGN?: any;
  };
};

export const getProfileConfig = (props: {
  config: ConfigType;
  fieldName: keyof typeof profileFieldsFromConfig;
  persona?: BusinessPersona;
}): any => {
  const configForField: ProfileFieldContent = (props.config.profileDefaults as any)["fields"][
    props.fieldName
  ];

  if (!props.persona) {
    return configForField.default;
  }

  const overridesForPersona = configForField.overrides ? configForField.overrides[props.persona] : undefined;

  if (overridesForPersona !== undefined) {
    return merge(configForField.default, overridesForPersona);
  }

  return configForField.default;
};
