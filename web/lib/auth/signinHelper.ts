import { Dispatch } from "react";
import { AuthAction } from "./AuthContext";
import * as session from "./sessionHelper";
import * as api from "../api-client/apiClient";
import { createEmptyUserData } from "../types/UserData";
import { getRoadmapUrl } from "../form-helpers/getRoadmapUrl";

export const onSignIn = async (
  push: (url: string) => Promise<boolean>,
  dispatch: Dispatch<AuthAction>
): Promise<void> => {
  const user = await session.getCurrentUser();

  dispatch({
    type: "LOGIN",
    user: user,
  });

  return api
    .getUserData(user.id)
    .then((userData) => {
      if (userData.formProgress === "COMPLETED") {
        push(getRoadmapUrl(userData.formData));
      } else {
        push("/");
      }
    })
    .catch(async () => {
      await api.postUserData(createEmptyUserData(user));
      push("/");
    });
};

export const onSignOut = (dispatch: Dispatch<AuthAction>): void => {
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
};
