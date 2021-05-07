import { Dispatch } from "react";
import { AuthAction } from "./AuthContext";
import * as session from "./sessionHelper";
import * as api from "@/lib/api-client/apiClient";
import { createEmptyUserData } from "../types/types";

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
        push("/roadmap");
      } else {
        push("/");
      }
    })
    .catch(async () => {
      await api.postUserData(createEmptyUserData(user));
      push("/");
    });
};

export const onSignOut = (push: (url: string) => Promise<boolean>, dispatch: Dispatch<AuthAction>): void => {
  push("/");
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
};
