import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useMockProfileData } from "@/test/mock/mockUseUserData";
import { ConfigContext, getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { fireEvent, render, screen } from "@testing-library/react";
import { GeneralInfo } from "@/components/tasks/cigarette-license/GeneralInfo";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("General Info", () => {
  const mockSetStepIndex = jest.fn();
  const mockSetShowNeedsAccountModal = jest.fn();
  const Config = getMergedConfig();

  beforeEach(() => {
    jest.clearAllMocks();
    useMockProfileData({});
  });

  const renderWithContext = (isAuthenticated: IsAuthenticated): void => {
    render(
      <ConfigContext.Provider value={{ config: Config, setOverrides: jest.fn() }}>
        <NeedsAccountContext.Provider
          value={{
            isAuthenticated,
            setShowNeedsAccountModal: mockSetShowNeedsAccountModal,
            showNeedsAccountModal: false,
            showNeedsAccountSnackbar: false,
            setShowNeedsAccountSnackbar: jest.fn(),
            registrationStatus: undefined,
            setRegistrationStatus: jest.fn(),
            showContinueWithoutSaving: false,
            setShowContinueWithoutSaving: jest.fn(),
            userWantsToContinueWithoutSaving: false,
            setUserWantsToContinueWithoutSaving: jest.fn(),
          }}
        >
          <GeneralInfo setStepIndex={mockSetStepIndex} />
        </NeedsAccountContext.Provider>
      </ConfigContext.Provider>,
    );
  };

  it("shows modal when clicking continue and user is not authenticated", () => {
    renderWithContext(IsAuthenticated.FALSE);

    const continueButton = screen.getByText(Config.cigaretteLicenseStep1.continueButtonText);
    fireEvent.click(continueButton);

    expect(mockSetShowNeedsAccountModal).toHaveBeenCalledWith(true);
    expect(mockSetStepIndex).not.toHaveBeenCalled();
  });

  it("advances to next step when clicking continue and user is authenticated", () => {
    renderWithContext(IsAuthenticated.TRUE);

    const continueButton = screen.getByText(Config.cigaretteLicenseStep1.continueButtonText);
    fireEvent.click(continueButton);

    expect(mockSetShowNeedsAccountModal).not.toHaveBeenCalled();
    expect(mockSetStepIndex).toHaveBeenCalledWith(1);
  });
});
