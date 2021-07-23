import { Dispatch } from "react";
import { AuthAction } from "./AuthContext";
import * as session from "./sessionHelper";
import * as api from "@/lib/api-client/apiClient";
import analytics from "@/lib/utils/analytics";

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
  analytics.dimensions.industry(userData.onboardingData.industry);
  analytics.dimensions.municipality(userData.onboardingData.municipality);
  analytics.dimensions.legalStructure(userData.onboardingData.legalStructure);
  analytics.dimensions.liquorLicense(userData.onboardingData.liquorLicense);
  analytics.dimensions.homeBasedBusiness(userData.onboardingData.homeBasedBusiness);
};

export const onSignOut = (push: (url: string) => Promise<boolean>, dispatch: Dispatch<AuthAction>): void => {
  push("/");
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
};
