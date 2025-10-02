import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { RemoveBusinessModal } from "./RemoveBusinessModal";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { withAuth, withRemoveBusinessContext } from "@/test/helpers/helpers-renderers";
import { removeBusinessSoftDelete } from "@/lib/domain-logic/removeBusinessSoftDelete";
import { useRouter } from "next/compat/router";

jest.mock("@/lib/data-hooks/useUserData");
jest.mock("@/lib/domain-logic/removeBusinessSoftDelete", () => ({
  removeBusinessSoftDelete: jest.fn(),
}));
jest.mock("next/compat/router", () => ({
  useRouter: jest.fn(),
}));

describe("RemoveBusinessModal", () => {
  const setShowRemoveBusinessModal = jest.fn();
  const Config = getMergedConfig();
  const businessName = "Lively Bakery";
  const mockRouterPush = jest.fn();
  const mockPush = jest.fn();
  const mockUpdate = jest.fn();
  const mockQueue = jest.fn(() => ({ update: mockUpdate }));
  const mockUpdateQueue = { queue: mockQueue, update: mockUpdate };

  const renderModal = (businessName?: string): void => {
    (useUserData as jest.Mock).mockReturnValue({
      userData: {
        businesses: {
          "biz-1": { id: "biz-1", dateDeletedISO: "", dateCreatedISO: "2025-01-01" },
          "biz-2": { id: "biz-2", dateDeletedISO: "", dateCreatedISO: "2025-02-01" },
        },
      },
      updateQueue: mockUpdateQueue,
      business: {
        id: "biz-1",
        dateCreatedISO: "2025-01-01",
        profileData: { businessName },
        taxFilingData: { businessName },
      },
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
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
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
    expect(removeBusinessSoftDelete).not.toHaveBeenCalled();
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("does not render error when remove is clicked with agreement", async () => {
    (removeBusinessSoftDelete as jest.Mock).mockReturnValue({
      id: "user-1",
      businesses: {
        "biz-2": { id: "biz-2", dateDeletedISO: "", dateCreatedISO: "2025-02-01" },
      },
    });
    renderModal(businessName);
    const checkboxInput = screen.getByRole("checkbox");
    fireEvent.click(checkboxInput);
    await waitFor(() => expect(checkboxInput).toBeChecked());

    expect(
      screen.queryByText(Config.removeBusinessModal.agreementCheckboxErrorText),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("modal-button-primary"));
    await waitFor(() => {
      expect(removeBusinessSoftDelete).toHaveBeenCalledWith({
        userData: expect.any(Object),
        idToSoftDelete: "biz-1",
        newCurrentBusinessId: "biz-2",
      });
    });
    await waitFor(() => {
      expect(mockQueue).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
