import { AuthContext } from "@/contexts/authContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { ActiveUser, AuthAction, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import { Roadmap, UserDataError } from "@/lib/types/types";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { Dispatch, ReactElement, SetStateAction } from "react";

export const withAuth = (
  subject: ReactElement,
  context: {
    activeUser?: ActiveUser;
    dispatch?: Dispatch<AuthAction>;
    isAuthenticated?: IsAuthenticated;
  }
): ReactElement => {
  const isAuthenticated =
    context.isAuthenticated || (context.activeUser ? IsAuthenticated.TRUE : IsAuthenticated.FALSE);
  const dispatch = context.dispatch || vi.fn();
  const state: AuthState = { isAuthenticated, activeUser: context.activeUser };
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

export const withNeedsAccountContext = (
  subject: ReactElement,
  isAuthenticated: IsAuthenticated,
  context?: {
    showNeedsAccountSnackbar?: boolean;
    showNeedsAccountModal?: boolean;
    registrationStatus?: RegistrationStatus;
    setRegistrationStatus?: (value: RegistrationStatus | undefined) => void;
    setShowNeedsAccountSnackbar?: (value: boolean) => void;
    setShowNeedsAccountModal?: (value: boolean) => void;
  }
): ReactElement => {
  return (
    <NeedsAccountContext.Provider
      value={{
        isAuthenticated,
        showNeedsAccountSnackbar: context?.showNeedsAccountSnackbar ?? false,
        showNeedsAccountModal: context?.showNeedsAccountModal ?? false,
        registrationStatus: context?.registrationStatus ?? undefined,
        setRegistrationStatus: context?.setRegistrationStatus || vi.fn(),
        setShowNeedsAccountSnackbar: context?.setShowNeedsAccountSnackbar || vi.fn(),
        setShowNeedsAccountModal: context?.setShowNeedsAccountModal || vi.fn(),
      }}
    >
      {subject}
    </NeedsAccountContext.Provider>
  );
};

export const withUserDataError = (
  subject: ReactElement,
  userDataError: UserDataError | undefined,
  setUserDataError?: (userDataError: UserDataError | undefined) => void
): ReactElement => {
  return (
    <UserDataErrorContext.Provider value={{ userDataError, setUserDataError: setUserDataError || vi.fn() }}>
      {subject}
    </UserDataErrorContext.Provider>
  );
};

export const withRoadmap = (params: {
  component: ReactElement;
  initialRoadmap: Roadmap | undefined;
  mockSetRoadmapFunction?: (roadmap: Roadmap | undefined) => void;
}): ReactElement => {
  return (
    <RoadmapContext.Provider
      value={{
        roadmap: params.initialRoadmap,
        setRoadmap: params.mockSetRoadmapFunction || vi.fn(),
      }}
    >
      {params.component}
    </RoadmapContext.Provider>
  );
};
