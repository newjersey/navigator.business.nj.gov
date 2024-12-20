import { Alert } from "@/components/njwds-extended/Alert";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { shouldShowDisclaimerForProfileNotSubmittingData } from "@/lib/domain-logic/shouldShowDisclaimerForProfileNotSubmittingData";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  business: Business | undefined;
  isAuthenticated: IsAuthenticated;
}

export const ProfileNoteDisclaimerForSubmittingData = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  if (!shouldShowDisclaimerForProfileNotSubmittingData(props.business, props.isAuthenticated)) {
    return <></>;
  }

  return (
    <Alert variant="note">{Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator}</Alert>
  );
};
