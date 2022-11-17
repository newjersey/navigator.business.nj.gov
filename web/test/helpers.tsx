import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { AuthAction, AuthState, IsAuthenticated } from "@/lib/auth/AuthContext";
import { Roadmap, SectionCompletion, UserDataError } from "@/lib/types/types";
import { BusinessUser, RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { fireEvent, MatcherFunction, screen, within } from "@testing-library/react";
import { Dayjs } from "dayjs";
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
        setRegistrationModalIsVisible: context?.setRegistrationModalIsVisible || jest.fn(),
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

export const getLastCalledWith = <T, R>(fn: jest.MockInstance<T, R[]>): R[] => {
  const lastIndex = fn.mock.calls.length - 1;
  return fn.mock.calls[lastIndex];
};

export const getNumberOfMockCalls = <T, R>(fn: jest.MockInstance<T, R[]>): number => {
  return fn.mock.calls.length;
};

export const randomElementFromArray = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

type Query = (f: MatcherFunction) => HTMLElement;

export const withMarkup = (query: Query) => {
  return (text: string): HTMLElement => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return query((_content: string, node: any) => {
      const hasText = (node: HTMLElement) => {
        return node.textContent === text;
      };
      // eslint-disable-next-line testing-library/no-node-access
      const childrenDontHaveText = [...node.children].every((child) => {
        return !hasText(child as HTMLElement);
      });
      return hasText(node) && childrenDontHaveText;
    });
  };
};

export const markdownToText = (text: string): string => {
  let returnText = text;
  if (text.includes("[")) {
    returnText = returnText.split("[")[1].split("]")[0].trim();
  }
  if (returnText.includes("#")) {
    returnText = returnText.split("#").join("").trim();
  }
  if (returnText.includes("*")) {
    returnText = returnText.split("*").join("").trim();
  }
  return returnText;
};

export const selectLocationByText = (value: string) => {
  fireEvent.mouseDown(screen.getByLabelText("Location"));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByText(value));
};

export const fillText = (label: string, value: string) => {
  const item = screen.getByLabelText(label);
  fireEvent.change(item, { target: { value: value } });
  fireEvent.blur(item);
};

export const selectDate = (date: Dayjs) => {
  const item = screen.getByLabelText("Date of formation");
  fireEvent.change(item, { target: { value: date.format("MM/YYYY") } });
  fireEvent.blur(item);
};

export const selectDropdownByValue = (label: string, value: string) => {
  fireEvent.mouseDown(screen.getByLabelText(label));
  const listbox = within(screen.getByRole("listbox"));
  fireEvent.click(listbox.getByTestId(value));
};
