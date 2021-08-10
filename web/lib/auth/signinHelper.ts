import { Dispatch } from "react";
import { AuthAction } from "./AuthContext";
import * as session from "./sessionHelper";
import * as api from "@/lib/api-client/apiClient";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";

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
  setAnalyticsDimensions(userData.onboardingData);
};

export const onSignOut = (push: (url: string) => Promise<boolean>, dispatch: Dispatch<AuthAction>): void => {
  push("/");
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
};
