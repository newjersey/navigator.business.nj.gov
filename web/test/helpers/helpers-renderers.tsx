import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { AuthAction, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import { Roadmap, UserDataError } from "@/lib/types/types";
import { BusinessUser, RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { Dispatch, ReactElement, SetStateAction } from "react";

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

export const withAuthAlert = (
  subject: ReactElement,
  isAuthenticated: IsAuthenticated,
  context?: {
    registrationAlertIsVisible?: boolean;
    registrationModalIsVisible?: boolean;
    registrationAlertStatus?: RegistrationStatus;
    setRegistrationAlertStatus?: (value: RegistrationStatus | undefined) => void;
    setRegistrationAlertIsVisible?: (value: boolean) => void;
    setRegistrationModalIsVisible?: (value: boolean) => void;
  }
): ReactElement => {
  return (
    <AuthAlertContext.Provider
      value={{
        isAuthenticated,
        registrationAlertIsVisible: context?.registrationAlertIsVisible ?? false,
        registrationModalIsVisible: context?.registrationModalIsVisible ?? false,
        registrationAlertStatus: context?.registrationAlertStatus ?? undefined,
        setRegistrationAlertStatus: context?.setRegistrationAlertStatus || jest.fn(),
        setRegistrationAlertIsVisible: context?.setRegistrationAlertIsVisible || jest.fn(),
        setRegistrationModalIsVisible: context?.setRegistrationModalIsVisible || jest.fn()
      }}
    >
      {subject}
    </AuthAlertContext.Provider>
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

export const withRoadmap = (params: {
  component: ReactElement;
  initialRoadmap: Roadmap | undefined;
  mockSetRoadmapFunction?: (roadmap: Roadmap | undefined) => void;
}): ReactElement => {
  return (
    <RoadmapContext.Provider
      value={{
        roadmap: params.initialRoadmap,
        setRoadmap: params.mockSetRoadmapFunction || jest.fn()
      }}
    >
      {params.component}
    </RoadmapContext.Provider>
  );
};
