import * as api from "@/lib/api-client/apiClient";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import analytics from "@/lib/utils/analytics";
import {
  setABExperienceDimension,
  setAnalyticsDimensions,
  setRegistrationDimension,
} from "@/lib/utils/analytics-helpers";
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
  setABExperienceDimension(userData.user.abExperience);
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
  const userDataStorage = UserDataStorageFactory();
  const abStorage = ABStorageFactory();
  let userData = userDataStorage.getCurrentUserData();
  if (userData?.user.myNJUserKey) {
    userDataStorage.deleteCurrentUser();
    userData = undefined;
  }
  const user = userData?.user || createEmptyUser(abStorage.getExperience());
  dispatch({
    type: "LOGIN_GUEST",
    user: user,
  });
  setABExperienceDimension(user.abExperience);
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

  const userDataStorage = UserDataStorageFactory();
  userDataStorage.delete(user.id);

  await triggerSignOut();
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
  push("/");
};
