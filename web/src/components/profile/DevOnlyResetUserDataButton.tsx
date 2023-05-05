import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const DevOnlyResetUserDataButton = (): ReactElement => {
  const { state } = useContext(AuthContext);
  const { update } = useUserData();
  const router = useRouter();

  const resetUserData = async (): Promise<void> => {
    if (state.user) {
      const emptyUserData = createEmptyUserData(state.user);
      await update(emptyUserData);
      router.push(ROUTES.landing);
    }
  };
  if (process.env.NODE_ENV === "development") {
    return (
      <SecondaryButton isColor="primary" onClick={resetUserData}>
        Reset User Data
      </SecondaryButton>
    );
  } else {
    return <></>;
  }
};
