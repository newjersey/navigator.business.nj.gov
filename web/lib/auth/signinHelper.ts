import { Dispatch } from "react";
import { AuthAction } from "./AuthContext";
import * as session from "./sessionHelper";

export const onSignIn = async (
  push: (url: string) => Promise<boolean>,
  dispatch: Dispatch<AuthAction>
): Promise<void> => {
  const user = await session.getCurrentUser();

  dispatch({
    type: "LOGIN",
    user: user,
  });
};

export const onSignOut = (push: (url: string) => Promise<boolean>, dispatch: Dispatch<AuthAction>): void => {
  push("/");
  dispatch({
    type: "LOGOUT",
    user: undefined,
  });
};
