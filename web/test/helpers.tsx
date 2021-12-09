import React, { Dispatch, ReactElement, SetStateAction } from "react";
import { AuthAction, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import {
  AuthContext,
  ContextualInfoContext,
  RoadmapContext,
  UserDataErrorContext,
  ContextualInfo,
} from "@/pages/_app";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { generateUserData } from "@/test/factories";
import { Roadmap, SectionCompletion, UserDataError } from "@/lib/types/types";
import { BusinessUser } from "@businessnjgovnavigator/shared";
import os from "os";
import { RenderResult } from "@testing-library/react";

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
  contextualInfo: ContextualInfo,
  setContextualInfo: Dispatch<SetStateAction<ContextualInfo>>
): ReactElement => {
  return (
    <ContextualInfoContext.Provider value={{ contextualInfo, setContextualInfo }}>
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

export const withRoadmap = (
  subject: ReactElement,
  roadmap: Roadmap | undefined,
  sectionCompletion: SectionCompletion | undefined,
  setRoadmap?: (roadmap: Roadmap | undefined) => void,
  setSectionCompletion?: (sectionCompletion: SectionCompletion | undefined) => void
): ReactElement => {
  return (
    <RoadmapContext.Provider
      value={{
        roadmap,
        sectionCompletion,
        setRoadmap: setRoadmap || jest.fn(),
        setSectionCompletion: setSectionCompletion || jest.fn(),
      }}
    >
      {subject}
    </RoadmapContext.Provider>
  );
};

export const generateUseUserDataResponse = (
  overrides: Partial<UseUserDataResponse>
): UseUserDataResponse => ({
  userData: generateUserData({}),
  update: jest.fn().mockResolvedValue({}),
  error: undefined,
  isLoading: false,
  refresh: jest.fn().mockResolvedValue({}),
  ...overrides,
});

export const getLastCalledWith = <T, R>(fn: jest.MockInstance<T, R[]>): R[] => {
  const lastIndex = fn.mock.calls.length - 1;
  return fn.mock.calls[lastIndex];
};

export const getPathSeparator = (): string => {
  const isWin = os.platform() === "win32";
  if (isWin) {
    return "\\";
  }

  return "/";
};

export const getByTextAcrossElements = (subject: RenderResult, text: string): HTMLElement => {
  return subject.getByText((content, node) => {
    if (!node) throw "html node does not exist";
    const hasText = (node: Element) => node.textContent === text;
    const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child as HTMLElement));
    return hasText(node) && childrenDontHaveText;
  });
};

export const queryByTextAcrossElements = (subject: RenderResult, text: string): HTMLElement | null => {
  return subject.queryByText((content, node) => {
    if (!node) throw "html node does not exist";
    const hasText = (node: Element) => node.textContent === text;
    const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child as HTMLElement));
    return hasText(node) && childrenDontHaveText;
  });
};
