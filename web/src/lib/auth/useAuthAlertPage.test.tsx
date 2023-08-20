import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useAuthAlertPage } from "@/lib/auth/useAuthAlertPage";
import { withAuth, withAuthAlert } from "@/test/helpers/helpers-renderers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

describe("useAuthAlertPage", () => {
  let setRegistrationAlertIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true, asPath: "", query: { fromOnboarding: "true" } });
    setRegistrationAlertIsVisible = jest.fn();
  });

  const setupHookWithAuth = ({
    hook,
    isAuth,
    registrationModalIsVisible,
  }: {
    hook: () => void;
    isAuth: IsAuthenticated;
    registrationModalIsVisible?: boolean;
  }): void => {
    function TestComponent(): null {
      hook();
      return null;
    }

    render(
      withAuth(
        withAuthAlert(<TestComponent />, isAuth ?? IsAuthenticated.TRUE, {
          registrationModalIsVisible: registrationModalIsVisible ?? false,
          setRegistrationAlertIsVisible,
        }),
        { isAuthenticated: isAuth }
      )
    );
  };

  describe("useAuthAlertPage", () => {
    it("hides alert when modal is visible", () => {
      setupHookWithAuth({
        hook: useAuthAlertPage,
        isAuth: IsAuthenticated.FALSE,
        registrationModalIsVisible: true,
      });
      expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("shows alert when user is not authed", () => {
      setupHookWithAuth({
        hook: useAuthAlertPage,
        isAuth: IsAuthenticated.FALSE,
        registrationModalIsVisible: false,
      });
      expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(true);
    });

    it("closes alert when user is not authed and is not routed from onboarding", () => {
      useMockRouter({ isReady: true, query: {} });
      setupHookWithAuth({
        hook: useAuthAlertPage,
        isAuth: IsAuthenticated.FALSE,
        registrationModalIsVisible: true,
      });
      expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("closes alert when user is not authed and is routed from onboarding", () => {
      useMockRouter({ isReady: true, query: { fromOnboarding: "true" } });
      setupHookWithAuth({
        hook: useAuthAlertPage,
        isAuth: IsAuthenticated.FALSE,
        registrationModalIsVisible: false,
      });
      expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(true);
    });

    it("does not show alert when user auth is unknown", () => {
      setupHookWithAuth({
        hook: useAuthAlertPage,
        isAuth: IsAuthenticated.UNKNOWN,
        registrationModalIsVisible: false,
      });
      expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("does not show alert when user is authed", () => {
      setupHookWithAuth({
        hook: useAuthAlertPage,
        isAuth: IsAuthenticated.TRUE,
        registrationModalIsVisible: false,
      });
      expect(setRegistrationAlertIsVisible).toHaveBeenCalledWith(false);
    });
  });
});
