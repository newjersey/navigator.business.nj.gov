import { NeedsAccountModal } from "@/components/auth/NeedsAccountModal";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

vi.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: vi.fn() }));
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));

describe("<NeedsAccount Modal />", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setShowNeedsAccountModal = vi.fn();

  const setupHookWithAuth = (isAuthenticated: IsAuthenticated, showNeedsAccountModal = true): void => {
    render(
      withNeedsAccountContext(<NeedsAccountModal />, isAuthenticated, {
        showNeedsAccountModal: showNeedsAccountModal,
        setShowNeedsAccountModal: setShowNeedsAccountModal,
      })
    );
  };

  it("shows Needs Account modal when user is in guest mode", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    expect(screen.getByText(Config.selfRegistration.needsAccountModalBody)).toBeInTheDocument();
  });

  it("does not show Needs Account modal when user is in guest mode and it's disabled", () => {
    setupHookWithAuth(IsAuthenticated.FALSE, false);
    expect(screen.queryByText(Config.selfRegistration.needsAccountModalBody)).not.toBeInTheDocument();
  });

  it("returns user to previous page when modal is closed", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByLabelText("close"));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("does not show Needs Account snackbar when user is authenticated", () => {
    setupHookWithAuth(IsAuthenticated.TRUE);
    expect(screen.queryByText(Config.selfRegistration.needsAccountModalBody)).not.toBeInTheDocument();
  });

  it("routes to account setup when link is clicked", async () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(Config.selfRegistration.needsAccountModalButtonText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.accountSetup);
  });

  it("closes modal when link to account setup is clicked", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(Config.selfRegistration.needsAccountModalButtonText));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("goes to myNJ when Log-in link is clicked", () => {
    setupHookWithAuth(IsAuthenticated.FALSE);
    fireEvent.click(screen.getByText(markdownToText(Config.selfRegistration.needsAccountModalSubText)));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
  });
});
