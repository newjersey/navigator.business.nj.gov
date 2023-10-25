import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isFormedOutsideNavigator } from "@/lib/domain-logic/isFormedOutsideNavigator";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  business: Business | undefined;
}

export const ProfileNoteForBusinessFormedOutsideNavigator = (props: Props): ReactElement => {
  const { Config } = useConfig();

  if (!isFormedOutsideNavigator(props.business)) {
    return <></>;
  }

  return (
    <Alert variant="note" borderSmall borderRight>
      {Config.profileDefaults.default.noteForBusinessesFormedOutsideNavigator}
    </Alert>
  );
};
