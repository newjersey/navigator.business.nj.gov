import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  fieldErrors: string[];
}

export const ProfileErrorAlert = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const displayProfileErrorAlert = (): boolean => props.fieldErrors.length > 0;

  const getLabel = (field: string): string => {
    return getProfileConfig({
      config: Config,
      fieldName: field as ProfileContentField,
    }).header;
  };

  const errorFieldsIds = (): string[] => {
    return props.fieldErrors.map((error) => {
      switch (error) {
        case "willSellPetCareItems":
          if (!props.fieldErrors.includes("petCareHousing")) {
            return "petCareHousing";
          }
          return error;
        case "employmentPlacementType":
          return "employmentPersonnelServiceType";
        case "residentialConstructionType":
          return "constructionType";
        default:
          return error;
      }
    });
  };

  const profileErrorAlertText = (): string =>
    errorFieldsIds().length === 1
      ? templateEval(Config.profileDefaults.default.profileErrorAlert, {
          fieldText: Config.profileDefaults.default.profileErrorAlertOneField,
        })
      : templateEval(Config.profileDefaults.default.profileErrorAlert, {
          fieldText: Config.profileDefaults.default.profileErrorAlertMultipleFields,
        });

  if (!displayProfileErrorAlert()) return null;

  return (
    <Alert variant="error" dataTestid={"profile-error-alert"}>
      <div>{profileErrorAlertText()}</div>
      <ul>
        {errorFieldsIds().map((id) => (
          <li key={id}>{getLabel(id)}</li>
        ))}
      </ul>
    </Alert>
  );
};
