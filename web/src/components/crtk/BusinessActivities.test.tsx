import { BusinessActivities } from "@/components/crtk/BusinessActivities";
import { generateCrtkData } from "@/test/factories";
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
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({ sendCrtkActivitiesEmail: jest.fn() }));

describe("BusinessActivities", () => {
  const Config = getMergedConfig();
  const userData = generateUserDataForBusiness(
    generateBusiness({
      crtkData: generateCrtkData(),
    }),
    {
      user: generateUser({ email: "test@example.com", name: "Test Name" }),
    },
  );

  const mockOnSearchAgain = jest.fn();
  const mockSetCrtkEmailSent = jest.fn();

  const renderComponent = (): void => {
    render(
      <WithStatefulUserData initialUserData={userData}>
        <BusinessActivities
          onSearchAgain={mockOnSearchAgain}
          setCrtkEmailSent={mockSetCrtkEmailSent}
        />
      </WithStatefulUserData>,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    setupStatefulUserDataContext();
  });

  it("toggles registered checkbox and render activites form accordingly", async () => {
    renderComponent();
    const registeredBusinessCheckbox = screen.getByRole("checkbox", {
      name: Config.crtkTask.registeredBusinessCheckboxLabel,
    });
    expect(registeredBusinessCheckbox).toBeInTheDocument();
    expect(screen.queryByTestId("activities-form")).not.toBeInTheDocument();
    expect(registeredBusinessCheckbox).not.toBeChecked();
    fireEvent.click(registeredBusinessCheckbox);
    expect(registeredBusinessCheckbox).toBeChecked();
    expect(screen.getByTestId("activities-form")).toBeInTheDocument();
  });

  it("calls onSearchAgain when clicking change it button", async () => {
    renderComponent();
    fireEvent.click(screen.getByText(Config.crtkTask.changeItLinkText));
    expect(mockOnSearchAgain).toHaveBeenCalled();
  });
});
