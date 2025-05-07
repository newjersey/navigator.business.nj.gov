import { Requirements } from "@/components/tasks/anytime-action/tax-clearance-certificate/steps/Requirements";
import { getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { withAuth, withNeedsAccountContext } from "@/test/helpers/helpers-renderers";
import { fireEvent, render, screen } from "@testing-library/react";

const Config = getMergedConfig();
const mockSetShowNeedsAccountModal = jest.fn();
const mockSetStepIndex = jest.fn();
const mockRequireAccount = jest.fn();

const renderRequirements = (authState = IsAuthenticated.FALSE): void => {
  render(
    withAuth(
      withNeedsAccountContext(<Requirements setStepIndex={mockSetStepIndex} />, authState, {
        showNeedsAccountModal: false,
        setShowNeedsAccountModal: mockSetShowNeedsAccountModal,
        requireAccount: mockRequireAccount,
      }),
      { isAuthenticated: authState },
    ),
  );
};

describe("<Requirements />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    sessionStorage.clear();
  });

  describe("when user is not authenticated", () => {
    it("shows NeedsAccountModal when Continue is clicked", () => {
      renderRequirements(IsAuthenticated.FALSE);
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep1.continueButtonText));
      expect(mockSetShowNeedsAccountModal).toHaveBeenCalledWith(true);
    });

    it("stores the correct returnToLink in sessionStorage", () => {
      renderRequirements(IsAuthenticated.FALSE);
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep1.continueButtonText));
      expect(sessionStorage.getItem("returnToLink")).toBe(ROUTES.taxClearanceCertificate);
    });

    it("calls requireAccount with correct returnToLink when Continue is clicked as guest", () => {
      renderRequirements(IsAuthenticated.FALSE);
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep1.continueButtonText));
      expect(mockRequireAccount).toHaveBeenCalledWith(ROUTES.taxClearanceCertificate);
    });
  });

  describe("when user is authenticated", () => {
    it("does not show NeedsAccountModal when Continue is clicked", () => {
      renderRequirements(IsAuthenticated.TRUE);
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep1.continueButtonText));
      expect(mockSetShowNeedsAccountModal).not.toHaveBeenCalled();
    });

    it("advances to the next step when Continue is clicked", () => {
      renderRequirements(IsAuthenticated.TRUE);
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep1.continueButtonText));
      expect(mockSetStepIndex).toHaveBeenCalledWith(1);
    });
  });
});
