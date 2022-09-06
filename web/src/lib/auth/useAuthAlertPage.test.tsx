import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useAuthAlertPage } from "@/lib/auth/useAuthAlertPage";
import { withAuth, withAuthAlert } from "@/test/helpers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("useAuthAlertPage", () => {
  let setAlertIsVisible: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({ isReady: true, asPath: "", query: { fromOnboarding: "true" } });
    setAlertIsVisible = jest.fn();
  });

  const setupHookWithAuth = ({
    hook,
    isAuth,
    modalIsVisible,
  }: {
    hook: () => void;
    isAuth: IsAuthenticated;
    modalIsVisible?: boolean;
  }): void => {
    function TestComponent() {
      hook();
      return null;
    }

    render(
      withAuth(
        withAuthAlert(<TestComponent />, isAuth ?? IsAuthenticated.TRUE, {
          modalIsVisible: modalIsVisible ?? false,
          setAlertIsVisible,
        }),
        { isAuthenticated: isAuth }
      )
    );
  };

  describe("useAuthAlertPage", () => {
    it("hides alert when modal is visible", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: true });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("shows alert when user is not authed", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: false });
      expect(setAlertIsVisible).toHaveBeenCalledWith(true);
    });

    it("closes alert when user is not authed and is not routed from onboarding", () => {
      useMockRouter({ isReady: true, query: {} });
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: true });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("closes alert when user is not authed and is routed from onboarding", () => {
      useMockRouter({ isReady: true, query: { fromOnboarding: "true" } });
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.FALSE, modalIsVisible: false });
      expect(setAlertIsVisible).toHaveBeenCalledWith(true);
    });

    it("does not show alert when user auth is unknown", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.UNKNOWN, modalIsVisible: false });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });

    it("does not show alert when user is authed", () => {
      setupHookWithAuth({ hook: useAuthAlertPage, isAuth: IsAuthenticated.TRUE, modalIsVisible: false });
      expect(setAlertIsVisible).toHaveBeenCalledWith(false);
    });
  });
});
