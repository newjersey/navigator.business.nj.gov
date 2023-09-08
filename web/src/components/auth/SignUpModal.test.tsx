import { SignUpModal } from "@/components/auth/SignUpModal";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import * as session from "@/lib/auth/sessionHelper";
import { ROUTES } from "@/lib/domain-logic/routes";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/auth/sessionHelper", () => ({ triggerSignIn: jest.fn() }));

const mockSession = session as jest.Mocked<typeof session>;

describe("SignUpModal", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setShowNeedsAccountModal = jest.fn();

  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, showNeedsAccountModal = true): void => {
    render(
      withNeedsAccountContext(<SignUpModal />, isAuthenticated, {
        showNeedsAccountModal: showNeedsAccountModal,
        setShowNeedsAccountModal: setShowNeedsAccountModal,
      })
    );
  };

  it("shows Needs Account snackbar when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByText(Config.navigationDefaults.guestModalBody)).toBeInTheDocument();
  });

  it("does not show Needs Account modal when user is in guest mode and it's disabled", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, false);
    expect(screen.queryByText(Config.navigationDefaults.guestModalBody)).not.toBeInTheDocument();
  });

  it("returns user to previous page when modal is closed", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByLabelText("close"));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("does not show Needs Account snackbar when user is authenticated", () => {
    setupHookWithAuth(IsAuthenticated.TRUE);
    expect(screen.queryByText(Config.navigationDefaults.guestModalBody)).not.toBeInTheDocument();
  });

  it("routes to account setup when link is clicked", async () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(Config.navigationDefaults.guestModalButtonText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.accountSetup);
  });

  it("closes modal when link to account setup is clicked", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(Config.navigationDefaults.guestModalButtonText));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("goes to myNJ when Log-in link is clicked", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(markdownToText(Config.navigationDefaults.guestModalSubText)));
    expect(mockSession.triggerSignIn).toHaveBeenCalled();
  });
});
