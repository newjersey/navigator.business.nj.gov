import { AuthContext } from "@/contexts/authContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { Roadmap, UserDataError } from "@/lib/types/types";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { Dispatch, ReactElement, SetStateAction } from "react";

export const withAuth = (
  subject: ReactElement,
  authState?: {
    isAuthenticated: IsAuthenticated;
    activeUser?: {
      id: string;
      email: string;
      encounteredMyNjLinkingError?: boolean;
    };
  },
): ReactElement => {
  return (
    <AuthContext.Provider
      value={{
        state: {
          isAuthenticated: authState?.isAuthenticated ?? IsAuthenticated.UNKNOWN,
          activeUser: authState?.activeUser,
        },
        dispatch: jest.fn(),
      }}
    >
      {subject}
    </AuthContext.Provider>
  );
};

export const withContextualInfo = (
  subject: ReactElement,
  contextualInfo: ContextualInfo,
  setContextualInfo: Dispatch<SetStateAction<ContextualInfo>>,
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
  },
): ReactElement => {
  return (
    <NeedsAccountContext.Provider
      value={{
        isAuthenticated,
        showNeedsAccountSnackbar: context?.showNeedsAccountSnackbar ?? false,
        showNeedsAccountModal: context?.showNeedsAccountModal ?? false,
        registrationStatus: context?.registrationStatus ?? undefined,
        setRegistrationStatus: context?.setRegistrationStatus || jest.fn(),
        setShowNeedsAccountSnackbar: context?.setShowNeedsAccountSnackbar || jest.fn(),
        setShowNeedsAccountModal: context?.setShowNeedsAccountModal || jest.fn(),
      }}
    >
      {subject}
    </NeedsAccountContext.Provider>
  );
};

export const withUserDataError = (
  subject: ReactElement,
  userDataError: UserDataError | undefined,
  setUserDataError?: (userDataError: UserDataError | undefined) => void,
): ReactElement => {
  return (
    <UserDataErrorContext.Provider
      value={{ userDataError, setUserDataError: setUserDataError || jest.fn() }}
    >
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
        setRoadmap: params.mockSetRoadmapFunction || jest.fn(),
      }}
    >
      {params.component}
    </RoadmapContext.Provider>
  );
};
