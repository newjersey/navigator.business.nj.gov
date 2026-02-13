import { ActivitiesForm } from "@/components/crtk/ActivitiesForm";
import * as api from "@/lib/api-client/apiClient";
import { generateCrtkData } from "@/test/factories";
import { fillTextUserEvent } from "@/test/helpers/helpers-testing-library-selectors";
import {
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import {
  generateBusiness,
  generateUser,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ sendCrtkActivitiesEmail: jest.fn() }));
const mockApi = api as jest.Mocked<typeof api>;

const mockOnSearchAgain = jest.fn();
const mockSetCrtkEmailSent = jest.fn();
const mockSetError = jest.fn();

describe("ActivitiesForm", () => {
  const Config = getMergedConfig();

  const userData = generateUserDataForBusiness(
    generateBusiness({
      crtkData: generateCrtkData(),
    }),
    {
      user: generateUser({ email: "test@example.com", name: "Test Name" }),
    },
  );

  beforeEach(() => {
    jest.clearAllMocks();
    setupStatefulUserDataContext();
  });

  const renderComponent = (): void => {
    render(
      <WithStatefulUserData initialUserData={userData}>
        <ActivitiesForm
          onSearchAgain={mockOnSearchAgain}
          setCrtkEmailSent={mockSetCrtkEmailSent}
          setError={mockSetError}
        />
      </WithStatefulUserData>,
    );
  };
  const validNaicsCode = "624410";
  const businessActivitiesText = "These are my business activities. We do a lot of things.";
  const materialOrProductsText = "These are my materials and products.";

  const fillForm = async (): Promise<void> => {
    await fillTextUserEvent(Config?.crtkTask?.businessActivitiesLabel, businessActivitiesText);
    await fillTextUserEvent(Config?.crtkTask?.materialsLabel, materialOrProductsText);
    await fillTextUserEvent(Config?.crtkTask?.naicsCodeLabel, validNaicsCode);
  };

  it("sends an email request with the appropriate data and updates crtkEmailSubmitted", async () => {
    renderComponent();
    await fillForm();

    fireEvent.click(screen.getByText(Config?.crtkTask?.submitButtonText));

    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    mockApi.sendCrtkActivitiesEmail.mockResolvedValue("SUCCESS");
    fireEvent.click(screen.getByText(Config?.crtkTask?.modalSendPrimaryButtonText));

    const currentBusiness = userData.businesses[userData.currentBusinessId];

    await waitFor(() => {
      expect(mockApi.sendCrtkActivitiesEmail).toHaveBeenCalledWith({
        username: userData.user.name,
        email: userData.user.email,
        businessName: currentBusiness?.crtkData?.crtkBusinessDetails?.businessName,
        businessStatus: currentBusiness?.profileData.businessPersona,
        businessAddress: currentBusiness?.crtkData?.crtkBusinessDetails?.addressLine1,
        industry: currentBusiness?.profileData.industryId,
        ein: currentBusiness?.crtkData?.crtkBusinessDetails?.ein,
        naicsCode: validNaicsCode,
        businessActivities: businessActivitiesText,
        materialOrProducts: materialOrProductsText,
      });
    });
    expect(mockSetCrtkEmailSent).toHaveBeenCalledWith(true);
  });

  it("closes the modal when cancel button is clicked", async () => {
    renderComponent();
    await fillForm();

    fireEvent.click(screen.getByText(Config?.crtkTask?.submitButtonText));

    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    fireEvent.click(screen.getByText(Config?.crtkTask?.modalSendSecondaryButtonText));
    expect(mockSetCrtkEmailSent).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByTestId("modal-content")).not.toBeInTheDocument();
    });
  });

  it("calls onSearchAgain when the back button is clicked", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(Config?.crtkTask?.goBackButtonText));
    expect(mockOnSearchAgain).toHaveBeenCalled();
  });

  it("sets error state when the email sending fails", async () => {
    renderComponent();
    await fillForm();
    fireEvent.click(screen.getByText(Config?.crtkTask?.submitButtonText));
    expect(screen.getByTestId("modal-content")).toBeInTheDocument();
    mockApi.sendCrtkActivitiesEmail.mockRejectedValue(new Error("FAILED"));
    fireEvent.click(screen.getByText(Config?.crtkTask?.modalSendPrimaryButtonText));

    await waitFor(() => {
      expect(mockSetError).toHaveBeenCalledWith(true);
    });
  });

  it("displays error alert when error state is true", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(Config.crtkTask.submitButtonText));
    await waitFor(() => {
      expect(screen.getByTestId("fields-error-alert")).toBeInTheDocument();
    });
  });
});
