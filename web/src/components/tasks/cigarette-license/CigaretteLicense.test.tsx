import { CigaretteLicense } from "@/components/tasks/cigarette-license/CigaretteLicense";
import { getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { fillTextUserEvent } from "@/test/helpers/helpers-testing-library-selectors";
import { useMockRoadmap } from "@/test/mock/mockUseRoadmap";
import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import userEvent from "@testing-library/user-event";
import {
  generateBusiness,
  generateCigaretteLicenseData,
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

    it("shows all tabs correctly", async () => {
      await renderComponent();

      const stepLength = 4;

      for (let stepIndex = 0; stepIndex < stepLength; stepIndex++) {
        const tab = screen.getByTestId(`stepper-${stepIndex}`);
        await userEvent.click(tab);

        expect(tab).toHaveAttribute("aria-selected", "true");
      }
    });

    it("calls setStepIndex when back button is clicked", async () => {
      await renderComponent(generateBusiness({}), 1);

      const backButton = screen.getByText("Back");
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
    describe("Licensee Info validations", () => {
      it("renders error for business name when empty and onBlur", async () => {
        await renderComponent(
          generateBusiness({
            profileData: {
              ...emptyProfileData,
              legalStructureId: "limited-liability-company",
            },
          }),
          1,
        );

        await fillTextUserEvent("Business name", "");

        expect(
          screen.getByText(Config.cigaretteLicenseStep2.businessNameErrorText),
        ).toBeInTheDocument();
      });

      it("renders error for responsible owner name when empty and onBlur", async () => {
        await renderComponent(
          generateBusiness({
            profileData: {
              ...emptyProfileData,
              legalStructureId: "sole-proprietorship",
            },
          }),
          1,
        );

        await fillTextUserEvent("Responsible owner name", "");

        expect(
          screen.getByText(
            Config.profileDefaults.fields.responsibleOwnerName.default.errorTextRequired,
          ),
        ).toBeInTheDocument();
      });

      it("renders error for trade name when empty and onBlur", async () => {
        await renderComponent(
          generateBusiness({
            profileData: {
              ...emptyProfileData,
              legalStructureId: "sole-proprietorship",
            },
          }),
          1,
        );

        await fillTextUserEvent("Trade name", "");

        expect(
          screen.getByText(Config.profileDefaults.fields.tradeName.default.errorTextRequired),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when tax id is blank", async () => {
        await renderComponent(
          generateBusiness({
            profileData: {
              ...generateProfileData({}),
              taxId: undefined,
              encryptedTaxId: undefined,
            },
            cigaretteLicenseData: {
              ...generateCigaretteLicenseData({
                taxId: undefined,
                encryptedTaxId: undefined,
              }),
            },
          }),
          1,
        );

        const taxIdField = screen.getByLabelText("Tax id");
        const showHideButton = screen.getByTestId("tax-id-show-hide-button");
        await userEvent.click(showHideButton);
        await userEvent.clear(taxIdField);
        await userEvent.tab();

        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when tax id is invalid", async () => {
        await renderComponent(
          generateBusiness({
            profileData: {
              ...generateProfileData({}),
              taxId: undefined,
              encryptedTaxId: undefined,
            },
            cigaretteLicenseData: {
              ...generateCigaretteLicenseData({
                taxId: undefined,
                encryptedTaxId: undefined,
              }),
            },
          }),
          1,
        );

        const taxIdField = screen.getByLabelText("Tax id");
        const showHideButton = screen.getByTestId("tax-id-show-hide-button");
        await userEvent.click(showHideButton);
        await userEvent.clear(taxIdField);
        await userEvent.type(taxIdField, "123456");
        await userEvent.tab();

        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when mailing address line 1 is empty", async () => {
        await renderComponent(generateBusiness({}), 1);

        await fillTextUserEvent("Mailing address line1", "");

        expect(
          screen.getByText(
            Config.cigaretteLicenseStep2.fields.mailingAddressLine1.errorRequiredText,
          ),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when mailing address line 2 is invalid", async () => {
        await renderComponent(generateBusiness({}), 1);

        await fillTextUserEvent(
          "Mailing address line2",
          "This address line 2 content has more than 35 characters and therefore it is invalid and should be rejected",
        );

        expect(
          screen.getByText(
            Config.cigaretteLicenseStep2.fields.mailingAddressLine2.errorValidationText,
          ),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when contact name is empty", async () => {
        await renderComponent(generateBusiness({}), 1);

        await fillTextUserEvent("Contact name", "");

        expect(
          screen.getByText(Config.cigaretteLicenseStep2.fields.contactName.errorRequiredText),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when contact email is invalid", async () => {
        await renderComponent(generateBusiness({}), 1);

        await fillTextUserEvent("Contact email", "invalid-email");

        expect(
          screen.getByText(Config.cigaretteLicenseStep2.fields.contactEmail.errorRequiredText),
        ).toBeInTheDocument();
      });

      it("renders error onBlur when contact phone is invalid", async () => {
        await renderComponent(generateBusiness({}), 1);

        await fillTextUserEvent("Contact phone number", "invalid-phone");

        expect(
          screen.getByText(
            Config.cigaretteLicenseStep2.fields.contactPhoneNumber.errorRequiredText,
          ),
        ).toBeInTheDocument();
      });
    });

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
            profileData: {
              ...emptyProfileData,
              legalStructureId: legalStructureId,
            },
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
