import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared/formationData";
import userEvent from "@testing-library/user-event";
import {
  generateBusiness,
  generateFormationData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { render, screen, waitFor } from "@testing-library/react";

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

describe("<CigaretteLicense />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockRoadmap({});
  });

  const renderComponent = async (business?: Business, stepIndex?: number): Promise<void> => {
    const userData = generateUserDataForBusiness(business ?? generateBusiness({}));

    render(
      <WithStatefulUserData initialUserData={userData}>
        <CigaretteLicense task={generateTask({ id: "cigarette-license" })} />
      </WithStatefulUserData>,
    );
    if (stepIndex) {
      const tab = screen.getByTestId(`stepper-${stepIndex}`);
      await userEvent.click(tab);
    }
  };

  describe("Stepper Functionality", () => {
    it("renders the first tab on load", async () => {
      await renderComponent();
      const firstTab = screen.getByTestId("stepper-0");
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("navigates to the previous step when back button is clicked", async () => {
      await renderComponent(generateBusiness({}), 1);

      const backButton = screen.getByText(Config.cigaretteLicenseStep2.backButtonText);
      await userEvent.click(backButton);

      expect(screen.getByRole("tab", { name: /General Info/ })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });

    it("allows navigation between all steps", async () => {
      await renderComponent();

      const stepsLength = 4;

      for (let stepIndex = 0; stepIndex < stepsLength; stepIndex++) {
        const tab = screen.getByTestId(`stepper-${stepIndex}`);
        await userEvent.click(tab);
        expect(tab).toHaveAttribute("aria-selected", "true");
      }
    });

    it("renders appropriate content for step 2", async () => {
      await renderComponent();

      const secondTab = screen.getByTestId("stepper-1");
      await userEvent.click(secondTab);

      await waitFor(() => {
        expect(
          screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationHeader),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Field Validation", () => {
    describe("Business name field visibility based on business type", () => {
      it.each([
        ["sole-proprietorship", ["Responsible owner name", "Trade name"], ["Business name"]],
        ["general-partnership", ["Responsible owner name", "Trade name"], ["Business name"]],
        ["limited-liability-company", ["Business name"], ["Responsible owner name", "Trade name"]],
        ["c-corporation", ["Business name"], ["Responsible owner name", "Trade name"]],
      ])(
        "for %s business type, %s fields are visible and %s fields are hidden",
        async (legalStructureId, presentFields, hiddenFields) => {
          const business = generateBusiness({
            profileData: generateProfileData({
              legalStructureId: legalStructureId,
            }),
            formationData: generateFormationData({
              formationFormData: createEmptyFormationFormData(),
            }),
          });

          await renderComponent(business, 1);

          for (const field of presentFields) {
            expect(screen.getByLabelText(field)).toBeInTheDocument();
          }
          for (const field of hiddenFields) {
            expect(screen.queryByLabelText(field)).not.toBeInTheDocument();
          }
        },
      );
    });
  });
});
