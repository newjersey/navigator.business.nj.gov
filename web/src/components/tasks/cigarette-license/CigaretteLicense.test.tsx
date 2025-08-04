import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { getMergedConfig } from "@/contexts/configContext";
import * as useConfigModule from "@/lib/data-hooks/useConfig";
import * as useUserDataModule from "@/lib/data-hooks/useUserData";
import { generateRoadmap, generateTask } from "@/test/factories";
import { setMockRoadmapResponse } from "@/test/mock/mockUseRoadmap";
import { generateUseUserDataResponse } from "@/test/mock/mockUseUserData";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { generateBusiness, generateUserDataForBusiness } from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useConfig", () => ({ useConfig: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const mockUseConfig = useConfigModule.useConfig as jest.MockedFunction<
  typeof useConfigModule.useConfig
>;
const mockUseUserData = useUserDataModule.useUserData as jest.MockedFunction<
  typeof useUserDataModule.useUserData
>;

describe("<CigaretteLicense />", () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({ Config });
    setMockRoadmapResponse({ roadmap: generateRoadmap({}) });
  });

  const renderComponent = (business?: Business): void => {
    const userData = generateUserDataForBusiness(business ?? generateBusiness({}));
    mockUseUserData.mockReturnValue(generateUseUserDataResponse({ userData }));

    render(
      <WithStatefulUserData initialUserData={userData}>
        <CigaretteLicense task={generateTask({ id: "cigarette-license" })} />
      </WithStatefulUserData>,
    );
  };

  describe("Stepper Functionality", () => {
    it("renders the first tab on load", () => {
      renderComponent();
      const stepOne = new RegExp(Config.cigaretteLicenseShared.stepperOneLabel);
      const firstTab = screen.getByRole("tab", { name: stepOne });
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("shows all tabs correctly", () => {
      renderComponent();

      const stepOne = new RegExp(Config.cigaretteLicenseShared.stepperOneLabel);
      const stepTwo = new RegExp(Config.cigaretteLicenseShared.stepperTwoLabel);
      const stepThree = new RegExp(Config.cigaretteLicenseShared.stepperThreeLabel);
      const stepFour = new RegExp(Config.cigaretteLicenseShared.stepperFourLabel);

      expect(screen.getByRole("tab", { name: stepOne })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: stepTwo })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: stepThree })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: stepFour })).toBeInTheDocument();
    });

    it("allows navigation between all steps", () => {
      renderComponent();

      const steps = [
        Config.cigaretteLicenseShared.stepperOneLabel,
        Config.cigaretteLicenseShared.stepperTwoLabel,
        Config.cigaretteLicenseShared.stepperThreeLabel,
        Config.cigaretteLicenseShared.stepperFourLabel,
      ];

      for (const stepLabel of steps) {
        const tab = screen.getByRole("tab", { name: new RegExp(stepLabel) });
        fireEvent.click(tab);
        expect(tab).toHaveAttribute("aria-selected", "true");
      }
    });

    it("allows navigation regardless of each step's form validation", () => {
      renderComponent();

      const stepThree = new RegExp(Config.cigaretteLicenseShared.stepperThreeLabel);
      const thirdTab = screen.getByRole("tab", { name: stepThree });
      fireEvent.click(thirdTab);

      expect(thirdTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders appropriate content for step 2", async () => {
      renderComponent();

      const stepTwo = new RegExp(Config.cigaretteLicenseShared.stepperTwoLabel);
      const secondTab = screen.getByRole("tab", { name: stepTwo });
      fireEvent.click(secondTab);

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationHeader),
        ).toBeInTheDocument();
      });
    });
  });
});
