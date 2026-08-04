import { NeedsAccountModal } from "@/components/auth/NeedsAccountModal";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush, useMockRouter } from "@/test/mock/mockRouter";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/api-client/apiClient", () => ({ postSelfReg: jest.fn() }));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("next/compat/router", () => ({ useRouter: jest.fn() }));

describe("<NeedsAccount Modal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    useMockBusiness({});
  });

  const setShowNeedsAccountModal = jest.fn();

  const setupHookWithAuth = ({
    isAuthenticated,
    showNeedsAccountModal,
  }: {
    isAuthenticated: IsAuthenticated;
    showNeedsAccountModal?: boolean;
  }): void => {
    render(
      withNeedsAccountContext(<NeedsAccountModal />, isAuthenticated, {
        showNeedsAccountModal: showNeedsAccountModal ?? true,
        setShowNeedsAccountModal: setShowNeedsAccountModal,
      }),
    );
  };

  it("shows Needs Account modal when user is in guest mode", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    expect(screen.getByText(Config.selfRegistration.needsAccountModalBody)).toBeInTheDocument();
  });

  it("does not show Needs Account modal when user is in guest mode and it's disabled", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE, showNeedsAccountModal: false });
    expect(
      screen.queryByText(Config.selfRegistration.needsAccountModalBody),
    ).not.toBeInTheDocument();
  });

  it("hides the modal when close button is clicked", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getByLabelText("close"));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("hides the modal when the continue exploring exploring button is clicked", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getByText(Config.selfRegistration.continueExploringButtonText));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("does not show Needs Account snackbar when user is authenticated", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.TRUE });
    expect(
      screen.queryByText(Config.selfRegistration.needsAccountModalBody),
    ).not.toBeInTheDocument();
  });

  it("routes to account setup when link is clicked", async () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getByText(Config.selfRegistration.needsAccountModalButtonText));
    expect(mockPush).toHaveBeenCalledWith(ROUTES.accountSetup);
  });

  it("closes modal when link to account setup is clicked", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(screen.getByText(Config.selfRegistration.needsAccountModalButtonText));
    expect(setShowNeedsAccountModal).toHaveBeenCalledWith(false);
  });

  it("goes to myNJ when Log-in link is clicked", () => {
    setupHookWithAuth({ isAuthenticated: IsAuthenticated.FALSE });
    fireEvent.click(
      screen.getByText(markdownToText(Config.selfRegistration.needsAccountModalSubText)),
    );
    expect(mockPush).toHaveBeenCalledWith(ROUTES.login);
  });
});
