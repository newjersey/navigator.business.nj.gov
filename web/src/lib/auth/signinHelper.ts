import { AuthAlertContextType } from "@/contexts/authAlertContext";
import * as api from "@/lib/api-client/apiClient";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import analytics from "@/lib/utils/analytics";
import {
  setABExperienceDimension,
  setAnalyticsDimensions,
  setRegistrationDimension,
} from "@/lib/utils/analytics-helpers";
import { createEmptyUser, UserData } from "@businessnjgovnavigator/shared/";
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

export type SelfRegRouter = {
  replace: (url: string) => Promise<boolean>;
  asPath: string | undefined;
};

export const onSelfRegister = (
  router: SelfRegRouter,
  userData: UserData | undefined,
  update: UseUserDataResponse["update"],
  setRegistrationAlertStatus: AuthAlertContextType["setRegistrationAlertStatus"],
  usereturnToLink?: boolean
) => {
  if (!userData) {
    return;
  }
  setRegistrationAlertStatus("IN_PROGRESS");
  let route;
  if (usereturnToLink) {
    route = userData.preferences.returnToLink;
  } else {
    route = router.asPath;
  }

  api
    .postSelfReg({
      ...userData,
      preferences: { ...userData.preferences, returnToLink: route || "" },
    })
    .then(async (response) => {
      await update(response.userData);
      await router.replace(response.authRedirectURL);
    })
    .catch((error) => {
      if (error === 409) {
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
    if (userData.formProgress === "UNSTARTED") {
      setRegistrationDimension("Began Onboarding");
      push(ROUTES.onboarding);
    } else {
      setRegistrationDimension("Onboarded Guest");
    }
  } else {
    if (pathname === ROUTES.onboarding) {
      setRegistrationDimension("Began Onboarding");
    } else if (pathname === ROUTES.loading) {
      setRegistrationDimension("Began Onboarding");
      push(ROUTES.onboarding);
    } else {
      setRegistrationDimension("Not Started");
      push(ROUTES.landing);
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
  push(ROUTES.landing);
};
