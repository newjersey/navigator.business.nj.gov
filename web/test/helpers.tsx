import React, { Dispatch, ReactElement } from "react";
import { AuthAction, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import { AuthContext, ContextualInfoContext, UserDataErrorContext } from "@/pages/_app";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { generateUserData } from "@/test/factories";
import { BusinessUser, UserDataError } from "@/lib/types/types";

export const withAuth = (
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

export const withUserDataError = (
  subject: ReactElement,
  userDataError: UserDataError | undefined,
  setUserDataError?: (userDataError: UserDataError | undefined) => void
): ReactElement => {
  return (
    <UserDataErrorContext.Provider value={{ userDataError, setUserDataError: setUserDataError || jest.fn() }}>
      {subject}
    </UserDataErrorContext.Provider>
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
