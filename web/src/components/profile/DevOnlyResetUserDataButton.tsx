import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { createEmptyUser } from "@businessnjgovnavigator/shared/businessUser";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const DevOnlyResetUserDataButton = (): ReactElement<any> => {
  const { state } = useContext(AuthContext);
  const { updateQueue } = useUserData();
  const router = useRouter();

  const resetUserData = async (): Promise<void> => {
    if (state.activeUser) {
      const emptyUser = {
        ...createEmptyUser(),
        email: state.activeUser.email,
        id: state.activeUser.id,
      };
      const emptyUserData = createEmptyUserData(emptyUser);
      await updateQueue?.queue(emptyUserData).update();
      router.push(ROUTES.landing);
    }
  };
  if (process.env.NODE_ENV === "development") {
    return (
      <div className="margin-top-2">
        <PrimaryButton isColor="accent-cooler" onClick={resetUserData}>
          Reset User Data
        </PrimaryButton>
      </div>
    );
  } else {
    return <></>;
  }
};
