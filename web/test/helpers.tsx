import React, { Dispatch, ReactElement } from "react";
import { AuthAction, AuthState } from "../lib/auth/AuthContext";
import { render, RenderResult } from "@testing-library/react";
import { AuthContext } from "../pages/_app";
import { UseUserDataResponse } from "../lib/data-hooks/useUserData";
import { generateUserData } from "./factories";
import { BusinessUser } from "../lib/types/types";

export const renderWithUser = (
  subject: ReactElement,
  user: BusinessUser | undefined,
  dispatch: Dispatch<AuthAction>
): RenderResult => {
  const state: AuthState = { isAuthenticated: !!user, user: user };
  return render(<AuthContext.Provider value={{ state, dispatch }}>{subject}</AuthContext.Provider>);
};

export const generateUseUserDataResponse = (
  overrides: Partial<UseUserDataResponse>
): UseUserDataResponse => ({
  userData: generateUserData({}),
  update: jest.fn(),
  isError: false,
  isLoading: false,
  ...overrides,
});
