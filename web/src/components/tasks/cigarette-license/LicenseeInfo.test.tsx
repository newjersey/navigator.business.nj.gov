import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { fillTextUserEvent } from "@/test/helpers/helpers-testing-library-selectors";

import { WithStatefulUserData } from "@/test/mock/withStatefulUserData";
import { emptyCigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { emptyFormationAddressData } from "@businessnjgovnavigator/shared/formationData";
import {
  generateBusiness,
  generateCigaretteLicenseData,
  generateFormationData,
  generateFormationFormData,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared/test";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import { createTheme, ThemeProvider } from "@mui/material";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactNode, useState } from "react";

/*
 * NOTE: Tests in this file use fireEvent.change() instead of userEvent.type() for numeric inputs
 * due to a known React 19 + MUI + @testing-library/user-event bug where userEvent.type() only
 * enters the first character in controlled numeric inputs.
 *
 * See: https://github.com/testing-library/user-event/issues/1286
 * "JavaScript heap out of memory" - userEvent.type() causes infinite loops with React 19 + MUI number inputs
 *
 * Once this upstream issue is fixed, these tests should be converted back to userEvent.type()
 * for more realistic user interaction simulation.
 */

const Config = getMergedConfig();

describe("<LicenseeInfo />", () => {
  const renderComponent = ({
    business,
    userData,
  }: {
    business?: Business;
    userData?: UserData;
    runValidations?: boolean;
  } = {}): void => {
    const testBusiness = business ?? generateBusinessWithDefaults();
    const testUserData = userData ?? generateUserDataForBusiness(testBusiness);

    const TestComponent = (): ReactNode => {
      const [cigaretteLicenseData, setCigaretteLicenseData] = useState(emptyCigaretteLicenseData);
      const [profileData, setProfileData] = useState(testBusiness.profileData);

      const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());
      return (
        <WithStatefulUserData initialUserData={testUserData}>
          <ThemeProvider theme={createTheme()}>
            <DataFormErrorMapContext.Provider value={formContextState}>
              <AddressContext.Provider
                value={{
                  state: {
                    formationAddressData: emptyFormationAddressData,
                  },
                  setAddressData: jest.fn(),
                }}
              >
                <CigaretteLicenseContext.Provider
                  value={{
                    state: cigaretteLicenseData,
                    setCigaretteLicenseData,
                    saveCigaretteLicenseData: jest.fn(),
                  }}
                >
                  <ProfileDataContext.Provider
                    value={{
                      state: {
                        profileData,
                        flow: "STARTING",
                      },
                      setProfileData,
                      onBack: (): void => {},
                    }}
                  >
                    <LicenseeInfo setStepIndex={jest.fn()} />
                  </ProfileDataContext.Provider>
                </CigaretteLicenseContext.Provider>
              </AddressContext.Provider>
            </DataFormErrorMapContext.Provider>
          </ThemeProvider>
        </WithStatefulUserData>
      );
    };

    render(<TestComponent />);
  };

  const generateBusinessWithDefaults = (overrides?: Partial<Business>): Business => {
    return generateBusiness({
      profileData: generateProfileData({
        businessName: "Test Business",
        responsibleOwnerName: "John Doe",
        tradeName: "Test Trade Name",
        taxId: "123456789000",
        encryptedTaxId: "123456789000",
        legalStructureId: "limited-liability-company",
      }),
      formationData: generateFormationData({
        formationFormData: generateFormationFormData({
          addressLine1: "123 Test St",
          addressLine2: "Suite 100",
          addressCity: "Test City",
          addressState: { shortCode: "NJ", name: "New Jersey" },
          addressZipCode: "12345",
        }),
      }),
      ...overrides,
    });
  };

  describe("Form Fields", () => {
    it("renders main section headers", () => {
      renderComponent();

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.licenseeInformationDescription),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.businessAddressHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.mailingAddressHeader),
      ).toBeInTheDocument();
      expect(
        screen.getByText(Config.cigaretteLicenseStep2.contactInformationHeader),
      ).toBeInTheDocument();
    });

    it("renders business information fields", () => {
      renderComponent();

      expect(screen.getByRole("textbox", { name: /business name/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/tax id/i)).toBeInTheDocument();
    });

    it("renders both business and mailing address fields", () => {
      renderComponent();

      const businessAddressContainer = within(screen.getByTestId("business-address-section"));
      expect(
        businessAddressContainer.getByRole("textbox", { name: /address line1/i }),
      ).toBeInTheDocument();
      expect(
        businessAddressContainer.getByRole("textbox", { name: /address city/i }),
      ).toBeInTheDocument();
      expect(
        businessAddressContainer.getByRole("combobox", { name: /address state/i }),
      ).toBeInTheDocument();
      expect(
        businessAddressContainer.getByRole("textbox", { name: /address zip code/i }),
      ).toBeInTheDocument();

      const mailingAddressContainer = within(screen.getByTestId("mailing-address-section"));
      expect(
        mailingAddressContainer.getByRole("textbox", { name: /address line1/i }),
      ).toBeInTheDocument();
      expect(
        mailingAddressContainer.getByRole("textbox", { name: /address city/i }),
      ).toBeInTheDocument();
      expect(
        mailingAddressContainer.getByRole("combobox", { name: /address state/i }),
      ).toBeInTheDocument();
      expect(
        mailingAddressContainer.getByRole("textbox", { name: /address zip code/i }),
      ).toBeInTheDocument();
    });

    it("renders contact information fields", () => {
      renderComponent();

      expect(screen.getByRole("textbox", { name: /contact name/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /contact phone number/i })).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: /contact email/i })).toBeInTheDocument();
    });

    it("pre-populates from business data", async () => {
      renderComponent();

      const businessNameField = screen.getByRole("textbox", { name: /business name/i });
      expect(businessNameField).toBeInTheDocument();
      expect(businessNameField).toHaveValue("Test Business");
    });

    it("allows user interaction with business name field", async () => {
      renderComponent();

      const businessNameField = screen.getByRole("textbox", { name: /business name/i });
      await userEvent.clear(businessNameField);
      await userEvent.type(businessNameField, "New Business Name");
      await userEvent.tab();

      expect(businessNameField).toHaveValue("New Business Name");
      expect(businessNameField).toHaveAttribute("aria-label", "Business name");
    });
  });

  describe("Locks Fields", () => {
    it("pre-populates businessNameField and taxIdField when taxData has been submitted", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessName: "Test Business",
          legalStructureId: "limited-liability-company",
        }),
        taxFilingData: {
          state: "SUCCESS",
          filings: [],
        },
      });
      renderComponent({ business });

      const businessNameField = screen.queryByRole("textbox", { name: /business name/i });
      expect(businessNameField).not.toBeInTheDocument();
      const businessNameValue = screen.getByText("Test Business");
      expect(businessNameValue).toBeInTheDocument();

      const taxIdField = screen.queryByRole("Tax id");
      expect(taxIdField).not.toBeInTheDocument();
      const taxIdValue = screen.getByText("****-****-****");
      expect(taxIdValue).toBeInTheDocument();
    });

    it("pre-populates business address if a business has formed", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          businessName: "Test Business",
          legalStructureId: "limited-liability-company",
        }),
        formationData: generateFormationData({
          completedFilingPayment: true,
          formationFormData: generateFormationFormData({
            addressLine1: "Test Address Line 1",
            addressCity: "Test City",
            addressMunicipality: undefined,
            addressZipCode: "07000",
          }),
        }),
      });
      renderComponent({ business });

      const businessNameField = screen.queryByRole("textbox", { name: /business name/i });
      expect(businessNameField).not.toBeInTheDocument();
      const businessNameValue = screen.getByText("Test Business");
      expect(businessNameValue).toBeInTheDocument();

      const addressLine1Field = screen.queryByRole("textbox", { name: /address line 1/i });
      expect(addressLine1Field).not.toBeInTheDocument();
      const addressValue = screen.getByTestId("locked-profileAddressLine1");
      expect(addressValue).toBeInTheDocument();
    });
  });

  describe("Field Validation", () => {
    it("renders error for business name when empty and onBlur", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "limited-liability-company",
        }),
      });
      renderComponent({ business });

      await fillTextUserEvent("Business name", "");

      expect(
        screen.getByText(Config.cigaretteLicenseStep2.businessNameErrorText),
      ).toBeInTheDocument();
    });

    it("renders error for responsible owner name when empty and onBlur", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderComponent({ business });

      await fillTextUserEvent("Responsible owner name", "");

      expect(
        screen.getByText(
          Config.profileDefaults.fields.responsibleOwnerName.default.errorTextRequired,
        ),
      ).toBeInTheDocument();
    });

    it("renders error for trade name when empty and onBlur", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          legalStructureId: "sole-proprietorship",
        }),
      });
      renderComponent({ business });

      await fillTextUserEvent("Trade name", "");

      expect(
        screen.getByText(Config.profileDefaults.fields.tradeName.default.errorTextRequired),
      ).toBeInTheDocument();
    });

    it("renders error onBlur when tax id is blank", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          taxId: undefined,
          encryptedTaxId: undefined,
        }),
        cigaretteLicenseData: generateCigaretteLicenseData({
          taxId: undefined,
          encryptedTaxId: undefined,
        }),
      });
      renderComponent({ business });

      const taxIdField = screen.getByLabelText("Tax id");
      const showHideButton = screen.getByTestId("tax-id-show-hide-button");
      await userEvent.click(showHideButton);
      await userEvent.clear(taxIdField);
      await userEvent.tab();

      expect(
        screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
      ).toBeInTheDocument();
    });

    it("shows and hides tax id when toggle button is clicked", async () => {
      const business = generateBusiness({
        profileData: generateProfileData({
          taxId: undefined,
          encryptedTaxId: undefined,
        }),
        cigaretteLicenseData: generateCigaretteLicenseData({
          taxId: undefined,
          encryptedTaxId: undefined,
        }),
      });
      renderComponent({ business });

      const taxIdField = screen.getByLabelText("Tax id") as HTMLInputElement;
      const showHideButton = screen.getByTestId("tax-id-show-hide-button");

      // Initially should be password type (hidden)
      expect(taxIdField.type).toBe("password");

      // Click to show
      await userEvent.click(showHideButton);
      await waitFor(() => {
        expect(taxIdField.type).toBe("text");
      });

      // Click to hide again
      await userEvent.click(showHideButton);
      await waitFor(() => {
        expect(taxIdField.type).toBe("password");
      });
    });
  });
});
