import { NeedsAccountContextType } from "@/contexts/needsAccountContext";
import * as api from "@/lib/api-client/apiClient";
import { ActiveUser, AuthAction } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ABStorageFactory } from "@/lib/storage/ABStorage";
import { AccountLinkingErrorStorageFactory } from "@/lib/storage/AccountLinkingErrorStorage";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { UpdateQueue } from "@/lib/UpdateQueue";
import analytics from "@/lib/utils/analytics";
import {
  setABExperienceDimension,
  setAnalyticsDimensions,
  setOnLoadDimensions,
  setRegistrationDimension,
  setUserId,
} from "@/lib/utils/analytics-helpers";
import { UserData, createEmptyUser, getCurrentBusiness } from "@businessnjgovnavigator/shared/";
import { Dispatch } from "react";
import * as session from "./sessionHelper";
import { triggerSignOut } from "./sessionHelper";

export const onSignIn = async (dispatch: Dispatch<AuthAction>): Promise<void> => {
  const user = await session.getActiveUser();
  dispatch({
    type: "LOGIN",
    activeUser: user,
  });

  const userData = await api.getUserData(user.id);
  setRegistrationDimension("Fully Registered");
  setOnLoadDimensions(userData);
};

export type SelfRegRouter = {
  replace: (url: string) => Promise<boolean>;
  asPath: string | undefined;
};

export const onSelfRegister = ({
  router,
  updateQueue,
  userData,
  setRegistrationStatus,
}: {
  router: SelfRegRouter;
  updateQueue: UpdateQueue | undefined;
  userData: UserData | undefined;
  setRegistrationStatus: NeedsAccountContextType["setRegistrationStatus"];
}): void => {
  if (!userData || !updateQueue) {
    return;
  }
  setRegistrationStatus("IN_PROGRESS");

  const { returnToLink } = getCurrentBusiness(userData).preferences;
  const fallback = router.asPath?.includes(ROUTES.accountSetup) ? "" : router.asPath || "";
  const route = returnToLink || fallback;

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
        setRegistrationStatus("DUPLICATE_ERROR");
      } else {
        setRegistrationStatus("RESPONSE_ERROR");
      }
    });
};

export const onGuestSignIn = async ({
  push,
  pathname,
  asPath,
  dispatch,
  encounteredMyNjLinkingError,
}: {
  push: (url: string) => Promise<boolean>;
  pathname: string;
  asPath?: string;
  dispatch: Dispatch<AuthAction>;
  encounteredMyNjLinkingError?: boolean | undefined;
}): Promise<void> => {
  // CRITICAL: Skip all guest signin logic for management pages - they handle their own auth
  if (pathname && pathname.startsWith("/mgmt/")) {
    return;
  }

  const userDataStorage = UserDataStorageFactory();
  const abStorage = ABStorageFactory();
  const accountLinkingErrorStorage = AccountLinkingErrorStorageFactory();
  let userData = userDataStorage.getCurrentUserData();
  if (userData?.user.myNJUserKey) {
    userDataStorage.deleteCurrentUser();
    userData = undefined;
  }

  const emptyUser = createEmptyUser();
  const activeUser: ActiveUser = userData?.user
    ? {
        email: userData.user.email,
        id: userData.user.id,
        encounteredMyNjLinkingError:
          encounteredMyNjLinkingError ??
          accountLinkingErrorStorage.getEncounteredMyNjLinkingError(),
      }
    : {
        email: emptyUser.email,
        id: emptyUser.id,
        encounteredMyNjLinkingError:
          encounteredMyNjLinkingError ??
          accountLinkingErrorStorage.getEncounteredMyNjLinkingError(),
      };
  dispatch({
    type: "LOGIN_GUEST",
    activeUser: activeUser,
  });
  setABExperienceDimension(abStorage.getExperience() || emptyUser.abExperience, true);
  if (encounteredMyNjLinkingError) {
    accountLinkingErrorStorage.setEncounteredMyNjLinkingError(encounteredMyNjLinkingError);
  }
  setUserId(activeUser.id, true);
  const onboardingRoute =
    asPath && asPath.startsWith(ROUTES.onboarding) ? asPath : ROUTES.onboarding;
  if (userData) {
    setAnalyticsDimensions(getCurrentBusiness(userData).profileData, true);
    if (getCurrentBusiness(userData).onboardingFormProgress === "UNSTARTED") {
      setRegistrationDimension("Began Onboarding");
      push(onboardingRoute);
    } else if (pathname === ROUTES.login) {
      setRegistrationDimension("Onboarded Guest");
      push(ROUTES.accountSetup);
    } else {
      setRegistrationDimension("Onboarded Guest");
    }
  } else {
    // Don't redirect management pages (/mgmt/*) - they handle their own auth
    if (pathname && pathname.startsWith("/mgmt/")) {
      setRegistrationDimension("Not Started");
      return;
    }

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
        if (!encounteredMyNjLinkingError) {
          setRegistrationDimension("Began Onboarding");
          push(onboardingRoute);
        }
        break;
      }
      case ROUTES.login: {
        setRegistrationDimension("Began Onboarding");
        push(onboardingRoute);
        break;
      }
      case ROUTES.njeda: {
        break;
      }
      case ROUTES.loginSupport: {
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
  dispatch: Dispatch<AuthAction>,
): Promise<void> => {
  analytics.event.roadmap_logout_button.click.log_out();
  const user = await session.getActiveUser();

  const userDataStorage = UserDataStorageFactory();
  userDataStorage.delete(user.id);

  await triggerSignOut();
  dispatch({
    type: "LOGOUT",
    activeUser: undefined,
  });
  push(ROUTES.landing);
};
