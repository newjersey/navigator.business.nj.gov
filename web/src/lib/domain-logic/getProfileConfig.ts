import type { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import type { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import type { profileFieldsFromConfig } from "@businessnjgovnavigator/shared/types";
import { merge } from "lodash";

type ProfileFieldText = string | Readonly<Record<string, string>>;
type ProfileFieldContent = Readonly<Record<string, ProfileFieldText>>;

interface FieldContent {
  readonly default: ProfileFieldContent;
  readonly overrides?: {
    readonly STARTING?: ProfileFieldContent;
    readonly OWNING?: ProfileFieldContent;
    readonly FOREIGN?: ProfileFieldContent;
  };
}

interface ProfileFieldConfig extends FieldContent {
  readonly onboarding?: FieldContent;
}

export const getProfileConfig = (props: {
  config: ConfigType;
  fieldName: keyof typeof profileFieldsFromConfig;
  onboarding?: boolean;
  persona?: BusinessPersona;
  // biome-ignore lint/suspicious/noExplicitAny: callers assign the result to per-field content types; a typed return needs a cross-caller retype
}): any => {
  const configForField: ProfileFieldConfig = props.config.profileDefaults.fields[props.fieldName];

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
