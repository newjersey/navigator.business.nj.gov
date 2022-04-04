import * as api from "@/lib/api-client/apiClient";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions, setRegistrationDimension } from "@/lib/utils/analytics-helpers";
import { UserDataStorage } from "@/lib/utils/userDataStorage";
import { AuthAlertContextType } from "@/pages/_app";
import { createEmptyUser, UserData } from "@businessnjgovnavigator/shared";
import { Dispatch } from "react";
import { AuthAction } from "./AuthContext";
import * as session from "./sessionHelper";
import { triggerSignOut } from "./sessionHelper";

export const onSignIn = async (
  push: (url: string) => Promise<boolean>,
  dispatch: Dispatch<AuthAction>
): Promise<void> => {
  const user = await session.getCurrentUser();
  dispatch({
    type: "LOGIN",
    user: user,
  });

  const userData = await api.getUserData(user.id);
  setAnalyticsDimensions(userData.profileData);
  setRegistrationDimension("Fully Registered");
};

export const onSelfRegister = (
  replace: (url: string) => Promise<boolean>,
  userData: UserData | undefined,
  update: UseUserDataResponse["update"],
  setRegistrationAlertStatus: AuthAlertContextType["setRegistrationAlertStatus"]
) => {
  if (!userData) return;
  setRegistrationAlertStatus("IN_PROGRESS");
  api
    .postSelfReg(userData)
    .then(async (response) => {
      await update(response.userData);
      await replace(response.authRedirectURL);
    })
    .catch((errorCode) => {
      if (errorCode === 409) {
        setRegistrationAlertStatus("DUPLICATE_ERROR");
      } else {
        setRegistrationAlertStatus("RESPONSE_ERROR");
      }
    });
};

export const onGuestSignIn = async (
  push: (url: string) => Promise<boolean>,
  pathname: string,
  dispatch: Dispatch<AuthAction>
): Promise<void> => {
  let userData = UserDataStorage().getCurrentUserData();
  if (userData?.user.myNJUserKey) {
    UserDataStorage().deleteCurrentUser();
    userData = undefined;
  }
  dispatch({
    type: "LOGIN_GUEST",
    user: userData?.user || createEmptyUser(),
  });
  if (userData) {
    setAnalyticsDimensions(userData.profileData);
    if (userData.formProgress == "UNSTARTED") {
      setRegistrationDimension("Began Onboarding");
      push("/onboarding");
    } else {
      setRegistrationDimension("Onboarded Guest");
    }
  } else {
    if (pathname == "/onboarding") {
      setRegistrationDimension("Began Onboarding");
    } else {
      setRegistrationDimension("Not Started");
      push("/");
    }
  }
};

export const onSignOut = async (
  push: (url: string) => Promise<boolean>,
  dispatch: Dispatch<AuthAction>
): Promise<void> => {
  analytics.event.roadmap_logout_button.click.log_out();
  const user = await session.getCurrentUser();
  UserDataStorage().delete(user.id);
  await triggerSignOut();
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
  push("/");
};
