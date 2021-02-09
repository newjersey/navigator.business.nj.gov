import { Dispatch, ReactElement } from "react";
import { AuthAction, AuthState } from "../lib/auth/AuthContext";
import { render, RenderResult } from "@testing-library/react";
import { AuthContext } from "../pages/_app";
import { BusinessUser } from "../lib/types";

export const renderWithUser = (
  subject: ReactElement,
  user: BusinessUser | undefined,
  dispatch: Dispatch<AuthAction>
): RenderResult => {
  const state: AuthState = { isAuthenticated: !!user, user: user };
  return render(
    <AuthContext.Provider value={{ state, dispatch }}>
      {subject}
    </AuthContext.Provider>
  );
};
