import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { getMergedConfig } from "@/contexts/configContext";
import * as useConfigModule from "@/lib/data-hooks/useConfig";
import * as useUserDataModule from "@/lib/data-hooks/useUserData";
import { generateRoadmap, generateTask } from "@/test/factories";
import { fillText } from "@/test/helpers/helpers-testing-library-selectors";
import { setMockRoadmapResponse } from "@/test/mock/mockUseRoadmap";
import { generateUseUserDataResponse } from "@/test/mock/mockUseUserData";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import {
  generateBusiness,
  generateFormationData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
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

  describe("Field Validation", () => {
    describe("Licensee Info validations", () => {
      const renderComponentOnStep2 = (): void => {
        const business = generateBusiness({
          profileData: emptyProfileData,
          formationData: generateFormationData({
            formationFormData: createEmptyFormationFormData(),
          }),
        });
        renderComponent(business);

        const secondTab = screen.getByRole("tab", { name: /Licensee Info/ });
        fireEvent.click(secondTab);
        expect(secondTab).toHaveAttribute("aria-selected", "true");
      };

      it("renders error for business name when empty and onBlur", () => {
        renderComponentOnStep2();

        fillText("Business name", "");
        fireEvent.blur(screen.getByLabelText("Business name"));

        expect(
          screen.getByText(Config.cigaretteLicenseStep2.businessNameErrorText),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when tax id is invalid", () => {
        renderComponentOnStep2();

        fillText("Tax id", "");
        fireEvent.blur(screen.getByLabelText("Tax id"));

        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
        ).toBeInTheDocument();

        fillText("Tax id", "123456");
        fireEvent.blur(screen.getByLabelText("Tax id"));

        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when address line 1 is empty", () => {
        renderComponentOnStep2();

        fillText("Address line1", "");
        fireEvent.blur(screen.getByLabelText("Address line1"));

        expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
      });

      it("renders error onBlur when contact information is empty", () => {
        renderComponentOnStep2();

        fillText("Contact name", "");
        fireEvent.blur(screen.getByLabelText("Contact name"));

        expect(
          screen.getByText(Config.cigaretteLicenseStep2.fields.contactName.errorRequiredText),
        ).toBeInTheDocument();
      });
    });

    describe("Business name field visibility based on business type", () => {
      const renderComponentOnStep2WithBusinessType = (legalStructureId: string): void => {
        const business = generateBusiness({
          profileData: {
            ...emptyProfileData,
            legalStructureId,
          },
          formationData: generateFormationData({
            formationFormData: createEmptyFormationFormData(),
          }),
        });
        renderComponent(business);

        const secondTab = screen.getByRole("tab", { name: /Licensee Info/ });
        fireEvent.click(secondTab);
        expect(secondTab).toHaveAttribute("aria-selected", "true");
      };

      it("shows responsible owner name and trade name fields for sole proprietorship", () => {
        renderComponentOnStep2WithBusinessType("sole-proprietorship");

        expect(screen.getByLabelText("Responsible owner name")).toBeInTheDocument();
        expect(screen.getByLabelText("Trade name")).toBeInTheDocument();
        expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
      });

      it("shows responsible owner name and trade name fields for general partnership", () => {
        renderComponentOnStep2WithBusinessType("general-partnership");

        expect(screen.getByLabelText("Responsible owner name")).toBeInTheDocument();
        expect(screen.getByLabelText("Trade name")).toBeInTheDocument();
        expect(screen.queryByLabelText("Business name")).not.toBeInTheDocument();
      });

      it("shows business name field for LLC", () => {
        renderComponentOnStep2WithBusinessType("limited-liability-company");

        expect(screen.getByLabelText("Business name")).toBeInTheDocument();
        expect(screen.queryByLabelText("Responsible owner name")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Trade name")).not.toBeInTheDocument();
      });

      it("shows business name field for corporation", () => {
        renderComponentOnStep2WithBusinessType("c-corporation");

        expect(screen.getByLabelText("Business name")).toBeInTheDocument();
        expect(screen.queryByLabelText("Responsible owner name")).not.toBeInTheDocument();
        expect(screen.queryByLabelText("Trade name")).not.toBeInTheDocument();
      });
    });
  });
});
