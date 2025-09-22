// RemoveBusinessModal.test.tsx
import { fireEvent, render, screen } from "@testing-library/react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { RemoveBusinessModal } from "./RemoveBusinessModal";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuth, withRemoveBusinessContext } from "@/test/helpers/helpers-renderers";

jest.mock("@/lib/data-hooks/useUserData");

describe("RemoveBusinessModal", () => {
  const setShowRemoveBusinessModal = jest.fn();
  const Config = getMergedConfig();
  const businessName = "Lively Bakery";

  const renderModal = (businessName?: string): void => {
    (useUserData as jest.Mock).mockReturnValue({
      business: businessName
        ? {
            profileData: { businessName: businessName },
            taxFilingData: { businessName: businessName },
          }
        : { profileData: {}, taxFilingData: {} },
    });

    render(
      withAuth(
        withRemoveBusinessContext(<RemoveBusinessModal />, {
          showRemoveBusinessModal: true,
          setShowRemoveBusinessModal,
        }),
        { isAuthenticated: IsAuthenticated.TRUE },
      ),
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when showRemoveBusinessModal is true", () => {
    renderModal(businessName);
    expect(screen.getByText(Config.removeBusinessModal.header)).toBeInTheDocument();
    expect(
      screen.getByText(Config.removeBusinessModal.irreversibleOperationText),
    ).toBeInTheDocument();
    expect(screen.getByText(Config.removeBusinessModal.agreementCheckboxText)).toBeInTheDocument();
    expect(
      screen.getByText(Config.removeBusinessModal.removeBusinessButtonText),
    ).toBeInTheDocument();
    expect(screen.getByText(Config.removeBusinessModal.cancelButtonText)).toBeInTheDocument();
  });

  it("sets show state to false when cancel button is clicked", () => {
    renderModal(businessName);
    fireEvent.click(screen.getByTestId("modal-button-secondary"));
    expect(setShowRemoveBusinessModal).toHaveBeenCalledWith(false);
  });

  it("renders error when remove is clicked without agreement", () => {
    renderModal(businessName);
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(
      screen.getByText(Config.removeBusinessModal.agreementCheckboxErrorText),
    ).toBeInTheDocument();
  });

  it("renders error when remove is clicked without agreement and clears error when agreement checkbox is clicked", () => {
    renderModal(businessName);
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(
      screen.getByText(Config.removeBusinessModal.agreementCheckboxErrorText),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("agree-checkbox"));
    expect(
      screen.queryByText(Config.removeBusinessModal.agreementCheckboxErrorText),
    ).not.toBeInTheDocument();
  });

  it("does not render error when agreement checkbox is clicked and calls the close method", () => {
    renderModal(businessName);
    fireEvent.click(screen.getByTestId("agree-checkbox"));
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    expect(
      screen.queryByText(Config.removeBusinessModal.agreementCheckboxErrorText),
    ).not.toBeInTheDocument();
    expect(setShowRemoveBusinessModal).toHaveBeenCalledWith(false);
  });
});
