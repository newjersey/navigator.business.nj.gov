import { Alert } from "@/components/njwds-extended/Alert";
import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ProfileContentField } from "@businessnjgovnavigator/shared/types";
import { ReactElement, RefObject } from "react";

interface Props {
  fieldErrors: string[];
  profileAlertRef?: RefObject<HTMLDivElement | null>;
}

export const ProfileErrorAlert = (props: Props): ReactElement | null => {
  const { fieldErrors, profileAlertRef } = props;
  const displayProfileErrorAlert = (): boolean => fieldErrors.length > 0;
  const { Config } = useConfig();

  const getLabel = (field: string): string => {
    // We should try not to do this; if you do need to disable typescript please include a comment justifying why.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const formationLabel = Config.formation.fields[field]?.label;

    return (
      formationLabel ||
      getProfileConfig({
        config: Config,
        fieldName: field as ProfileContentField,
      }).header
    );
  };

  const errorFieldsIds = (): string[] => {
    return fieldErrors.map((error) => {
      switch (error) {
        case "willSellPetCareItems":
          if (!fieldErrors.includes("petCareHousing")) {
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

  if (!displayProfileErrorAlert()) return null;

  return (
    <Alert variant="error" dataTestid={"profile-error-alert"} ref={profileAlertRef}>
      <div>{getProfileErrorAlertText(errorFieldsIds().length)}</div>
      <ul>
        {errorFieldsIds().map((id) => (
          <li key={id}>{getLabel(id)}</li>
        ))}
      </ul>
    </Alert>
  );
};
