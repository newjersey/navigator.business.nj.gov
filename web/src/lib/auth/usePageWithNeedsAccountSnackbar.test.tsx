import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { usePageWithNeedsAccountSnackbar } from "@/lib/auth/usePageWithNeedsAccountSnackbar";
import { withAuth, withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { useMockRouter } from "@/test/mock/mockRouter";
import { render } from "@testing-library/react";

vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));

describe("usePageWithNeedsAccountSnackbar", () => {
  let setShowNeedsAccountSnackbar: vi.Mock;

  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({ isReady: true, asPath: "", query: { fromOnboarding: "true" } });
    setShowNeedsAccountSnackbar = vi.fn();
  });

  const setupHookWithAuth = ({
    hook,
    isAuth,
    showNeedsAccountModal,
  }: {
    hook: () => void;
    isAuth: IsAuthenticated;
    showNeedsAccountModal?: boolean;
  }): void => {
    function TestComponent(): null {
      hook();
      return null;
    }

    render(
      withAuth(
        withNeedsAccountContext(<TestComponent />, isAuth ?? IsAuthenticated.TRUE, {
          showNeedsAccountModal: showNeedsAccountModal ?? false,
          setShowNeedsAccountSnackbar,
        }),
        { isAuthenticated: isAuth }
      )
    );
  };

  describe("useAuthAlertPage", () => {
    it("hides alert when modal is visible", () => {
      setupHookWithAuth({
        hook: usePageWithNeedsAccountSnackbar,
        isAuth: IsAuthenticated.FALSE,
        showNeedsAccountModal: true,
      });
      expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(false);
    });

    it("shows alert when user is not authed", () => {
      setupHookWithAuth({
        hook: usePageWithNeedsAccountSnackbar,
        isAuth: IsAuthenticated.FALSE,
        showNeedsAccountModal: false,
      });
      expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(true);
    });

    it("closes alert when user is not authed and is not routed from onboarding", () => {
      useMockRouter({ isReady: true, query: {} });
      setupHookWithAuth({
        hook: usePageWithNeedsAccountSnackbar,
        isAuth: IsAuthenticated.FALSE,
        showNeedsAccountModal: true,
      });
      expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(false);
    });

    it("closes alert when user is not authed and is routed from onboarding", () => {
      useMockRouter({ isReady: true, query: { fromOnboarding: "true" } });
      setupHookWithAuth({
        hook: usePageWithNeedsAccountSnackbar,
        isAuth: IsAuthenticated.FALSE,
        showNeedsAccountModal: false,
      });
      expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(true);
    });

    it("does not show alert when user auth is unknown", () => {
      setupHookWithAuth({
        hook: usePageWithNeedsAccountSnackbar,
        isAuth: IsAuthenticated.UNKNOWN,
        showNeedsAccountModal: false,
      });
      expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(false);
    });

    it("does not show alert when user is authed", () => {
      setupHookWithAuth({
        hook: usePageWithNeedsAccountSnackbar,
        isAuth: IsAuthenticated.TRUE,
        showNeedsAccountModal: false,
      });
      expect(setShowNeedsAccountSnackbar).toHaveBeenCalledWith(false);
    });
  });
});
