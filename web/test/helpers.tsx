import React, { Dispatch, ReactElement } from "react";
import { AuthAction, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import { AuthContext, ContextualInfoContext } from "@/pages/_app";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { generateUserData } from "@/test/factories";
import { BusinessUser } from "@/lib/types/types";

export const withUser = (
  subject: ReactElement,
  context: {
    user?: BusinessUser;
    dispatch?: Dispatch<AuthAction>;
    isAuthenticated?: IsAuthenticated;
  }
): ReactElement => {
  const isAuthenticated =
    context.isAuthenticated || (context.user ? IsAuthenticated.TRUE : IsAuthenticated.FALSE);
  const dispatch = context.dispatch || jest.fn();
  const state: AuthState = { isAuthenticated, user: context.user };
  return <AuthContext.Provider value={{ state, dispatch }}>{subject}</AuthContext.Provider>;
};

export const withContextualInfo = (
  subject: ReactElement,
  contextualInfoMd: string,
  setContextualInfoMd: (contextualInfoMd: string) => void
): ReactElement => {
  return (
    <ContextualInfoContext.Provider value={{ contextualInfoMd, setContextualInfoMd }}>
      {subject}
    </ContextualInfoContext.Provider>
  );
};

export const generateUseUserDataResponse = (
  overrides: Partial<UseUserDataResponse>
): UseUserDataResponse => ({
  userData: generateUserData({}),
  update: jest.fn().mockResolvedValue({}),
  error: undefined,
  isLoading: false,
  ...overrides,
});

export const getLastCalledWith = (fn: jest.Mock): unknown[] => {
  const lastIndex = fn.mock.calls.length - 1;
  return fn.mock.calls[lastIndex];
};
