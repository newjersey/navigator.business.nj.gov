import { AuthAlertContextType } from "@/contexts/authAlertContext";
import * as api from "@/lib/api-client/apiClient";
import { AuthAction } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { UpdateQueue } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  setABExperienceDimension,
  setAnalyticsDimensions,
  setOnLoadDimensions,
  setRegistrationDimension,
  setUserId,
} from "@/lib/utils/analytics-helpers";
import { createEmptyUser, getCurrentBusiness, UserData } from "@businessnjgovnavigator/shared/";
import { Dispatch } from "react";
import * as session from "./sessionHelper";
import { triggerSignOut } from "./sessionHelper";

export const onSignIn = async (dispatch: Dispatch<AuthAction>): Promise<void> => {
  const user = await session.getCurrentUser();
  dispatch({
    type: "LOGIN",
    user: user,
  });

  const userData = await api.getUserData(user.id);
  setRegistrationDimension("Fully Registered");
  setOnLoadDimensions(userData);
};

export type SelfRegRouter = {
  replace: (url: string) => Promise<boolean>;
  asPath: string | undefined;
};

export const onSelfRegister = (
  router: SelfRegRouter,
  updateQueue: UpdateQueue | undefined,
  userData: UserData | undefined,
  setRegistrationAlertStatus: AuthAlertContextType["setRegistrationAlertStatus"]
): void => {
  if (!userData || !updateQueue) {
    return;
  }
  setRegistrationAlertStatus("IN_PROGRESS");
  const route = getCurrentBusiness(userData).preferences.returnToLink || router.asPath || "";

  api
    .postSelfReg({
      ...userData,
      businesses: {
        ...userData.businesses,
        [userData.currentBusinessId]: {
          ...userData.businesses[userData.currentBusinessId],
          preferences: {
            ...userData.businesses[userData.currentBusinessId].preferences,
            returnToLink: route,
          },
        },
      },
    })
    .then(async (response) => {
      await updateQueue.queue(response.userData).update();
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
  setABExperienceDimension(user.abExperience, true);
  setUserId(user.id, true);
  if (userData) {
    setAnalyticsDimensions(getCurrentBusiness(userData).profileData, true);
    if (getCurrentBusiness(userData).onboardingFormProgress === "UNSTARTED") {
      setRegistrationDimension("Began Onboarding");
      push(ROUTES.onboarding);
    } else {
      setRegistrationDimension("Onboarded Guest");
    }
  } else {
    switch (pathname) {
      case ROUTES.welcome: {
        setRegistrationDimension("Not Started");
        push(ROUTES.welcome);

        break;
      }
      case ROUTES.onboarding: {
        setRegistrationDimension("Began Onboarding");

        break;
      }
      case ROUTES.loading: {
        setRegistrationDimension("Began Onboarding");
        push(ROUTES.onboarding);

        break;
      }
      default: {
        setRegistrationDimension("Not Started");
        push(ROUTES.landing);
      }
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
