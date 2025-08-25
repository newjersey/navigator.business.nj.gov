import { AnytimeActionTaxClearanceCertificate } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificate";
import * as api from "@/lib/api-client/apiClient";
import { formatAddress } from "@/lib/domain-logic/formatAddress";
import { generateAnytimeActionTask } from "@/test/factories";
import {
  fillText,
  getInputElementByLabel,
  selectComboboxValueByTextClick,
} from "@/test/helpers/helpers-testing-library-selectors";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  createEmptyFormationFormData,
  emptyProfileData,
  emptyTaxClearanceCertificateData,
  generateBusiness,
  generateFormationData,
  generateFormationFormData,
  generateMunicipality,
  generateProfileData,
  generateTaxClearanceCertificateData,
  generateUnitedStatesStateDropdownOption,
  generateUserData,
  generateUserDataForBusiness,
  getTaxClearanceCertificateAgencies,
  LookupTaxClearanceCertificateAgenciesById,
  randomElementFromArray,
  StateObject,
  TaxClearanceCertificateData,
  TaxClearanceCertificateResponse,
  TaxClearanceCertificateResponseErrorType,
} from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import * as materialUi from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxClearanceCertificate: jest.fn(),
  postUserData: jest.fn(),
}));
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));

const mockApi = api as jest.Mocked<typeof api>;

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

describe("<AnyTimeActionTaxClearanceCertificate />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const anytimeAction = generateAnytimeActionTask({
    filename: "tax-clearance-certificate",
    name: "header",
  });

  const renderComponent = ({
    business,
    userData,
  }: {
    business?: Business;
    userData?: UserData;
  }): void => {
    render(
      <ThemeProvider theme={createTheme()}>
        <WithStatefulUserData
          initialUserData={
            userData ?? generateUserDataForBusiness(business ?? generateBusiness({}))
          }
        >
          <AnytimeActionTaxClearanceCertificate anytimeAction={anytimeAction} />
        </WithStatefulUserData>
      </ThemeProvider>,
    );
  };

  const generateBusinessWithEmptyTaxClearanceData = (): Business => {
    return generateBusiness({
      profileData: generateProfileData({ businessName: "", taxId: undefined, taxPin: undefined }),
      taxClearanceCertificateData: emptyTaxClearanceCertificateData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
  };

  const generateBusinessWithEmptyProfileDataAndFormationDataData = (
    taxClearanceOverides: Partial<TaxClearanceCertificateData>,
  ): Business => {
    return generateBusiness({
      profileData: generateProfileData({ businessName: "", taxId: undefined, taxPin: undefined }),
      taxClearanceCertificateData: generateTaxClearanceCertificateData(taxClearanceOverides),
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
  };

  it("renders header", () => {
    renderComponent({});
    const mainHeader = screen.getByText("header");
    expect(mainHeader).toBeInTheDocument();
  });

  describe("navigation", () => {
    it("renders the requirements tab on load", () => {
      renderComponent({});
      const firstTab = screen.getByRole("tab", { name: /Requirements Step/ });
      expect(firstTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders the eligibility tab on click", () => {
      renderComponent({});
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders the review tab on click", () => {
      renderComponent({});
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders back to tab one when the back button is clicked on tab 2", () => {
      renderComponent({});
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.backButtonText));
      const firstTab = screen.getByRole("tab", { name: /Requirements Step/ });
      expect(firstTab).toBeInTheDocument();
    });

    it("renders tab three when the save button is clicked on tab two", () => {
      renderComponent({});
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.saveButtonText));
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      expect(thirdTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders back to tab two when the back button is clicked on tab three", () => {
      renderComponent({});
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.backButtonText));
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders back to tab two when the back edit button is clicked on tab three", () => {
      renderComponent({});
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep3.editButtonText));
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders back to tab two after clicking on a field error in the alert box", async () => {
      renderComponent({});
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      fillText("Tax pin", "");

      expect(screen.getByTestId("tax-clearance-error-alert")).toBeInTheDocument();

      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);

      const fieldErrorLink = screen.getByRole("link", { name: /Tax PIN/ });
      fireEvent.click(fieldErrorLink);

      expect(secondTab).toHaveAttribute("aria-selected", "true");
    });

    it("renders tab one as complete when on tab two", () => {
      const business = generateBusinessWithEmptyTaxClearanceData();
      renderComponent({ business });
      const firstTab = screen.getByRole("tab", { name: /Requirements Step/ });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      expect(firstTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
      expect(firstTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
    });

    it("renders tab one as complete when on tab three", () => {
      const business = generateBusinessWithEmptyTaxClearanceData();
      renderComponent({ business });
      const firstTab = screen.getByRole("tab", { name: /Requirements Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      expect(firstTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));

      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");
      expect(firstTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
    });

    it("renders tab one as incomplete when viewing tab one and not all required data is provided", () => {
      const business = generateBusinessWithEmptyTaxClearanceData();
      renderComponent({ business });
      const firstTab = screen.getByRole("tab", { name: /Requirements Step/ });
      expect(firstTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
    });

    it("renders tab one as complete when viewing tab one and all required data is provided", () => {
      renderComponent({});
      const firstTab = screen.getByRole("tab", { name: /Requirements Step/ });
      expect(firstTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
    });

    it("renders tab two as complete when all required fields are non empty and valid", async () => {
      renderComponent({ business: generateBusinessWithEmptyTaxClearanceData() });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });

      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      fireEvent.click(secondTab);

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Business name", "Test Name");
      fillText("Address line1", "123 Test Road");
      fillText("Address city", "Baltimore");
      selectComboboxValueByTextClick("Address state", "MD");
      fillText("Address zip code", "21210");
      fillText("Tax id", "012345678901");
      fillText("Tax pin", "1234");

      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
    });

    it.each([
      "Business name",
      "Address line1",
      "Address city",
      "Address zip code",
      "Tax id",
      "Tax pin",
    ])("renders tab two as error if the text field %s is empty", (emptyField) => {
      renderComponent({});
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
      fireEvent.click(secondTab);

      fillText(emptyField, "");
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders tab two as incomplete if Requesting Agency is not selected", async () => {
      renderComponent({ business: generateBusinessWithEmptyTaxClearanceData() });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      fireEvent.click(secondTab);

      fillText("Business name", "Test Name");
      fillText("Address line1", "123 Test Road");
      fillText("Address city", "Baltimore");
      selectComboboxValueByTextClick("Address state", "MD");
      fillText("Address zip code", "21210");
      fillText("Tax id", "012345678901");
      fillText("Tax pin", "1234");

      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
    });

    it("renders tab two as Error if Address state is not selected", async () => {
      renderComponent({ business: generateBusinessWithEmptyTaxClearanceData() });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      fireEvent.click(secondTab);

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Business name", "Test Name");
      fillText("Address line1", "123 Test Road");
      fillText("Address city", "Baltimore");
      fillText("Address zip code", "21210");
      fillText("Tax id", "012345678901");
      fillText("Tax pin", "1234");

      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));

      selectComboboxValueByTextClick("Address state", "MD");
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
    });

    it.each(["Address zip code", "Tax id", "Tax pin"])(
      "renders tab two as error when all fields are non empty but the %s field does not have enough digits",
      async (incompleteField) => {
        renderComponent({});
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Complete"));
        fireEvent.click(secondTab);

        fillText(incompleteField, "123");
        expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
      },
    );
  });

  describe("renders data from userData", () => {
    describe("when there is valid data in taxClearanceCertificateData", () => {
      it("renders requestingAgencyId", () => {
        const agencyId = randomElementFromArray(getTaxClearanceCertificateAgencies());
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            requestingAgencyId: agencyId.id,
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(screen.getByText(agencyId.name)).toBeInTheDocument();
      });

      it("renders business name", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            businessName: "business name in taxClearanceCertificateData",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Business name").value).toEqual(
          "business name in taxClearanceCertificateData",
        );
      });

      it("renders addressLine1", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressLine1: "1010 Main Street",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address line1").value).toEqual("1010 Main Street");
      });

      it("renders addressLine2", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressLine2: "1010 Main Street",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address line2").value).toEqual("1010 Main Street");
      });

      it("renders city", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressCity: "1010 Main Street",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address city").value).toEqual("1010 Main Street");
      });

      it("renders address state", () => {
        const addressState = generateUnitedStatesStateDropdownOption({});
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressState: addressState,
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address state").value).toEqual(addressState.shortCode);
      });

      it("renders zip code", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressZipCode: "12345",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address zip code").value).toEqual("12345");
      });

      it("renders tax id", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            taxId: "123456789123",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Tax id").value).toEqual("123-456-789/123");
      });

      it("renders tax pin", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            taxPin: "1234",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Tax pin").value).toEqual("1234");
      });
    });

    describe("when data in taxClearanceCertificateData is an empty string", () => {
      it("renders business name from profile data", () => {
        const business = generateBusiness({
          profileData: generateProfileData({ businessName: "business name in profile data" }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ businessName: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Business name").value).toEqual(
          "business name in profile data",
        );
      });

      it("renders addressLine1 from formation form data", () => {
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressLine1: "1010 Main Street",
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ addressLine1: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address line1").value).toEqual("1010 Main Street");
      });

      it("renders addressLine2 from formation form data", () => {
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressLine2: "1010 Main Street",
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ addressLine2: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address line2").value).toEqual("1010 Main Street");
      });

      it("renders addressCity from formation form data when addressMunicipality is undefined", () => {
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressCity: "1010 Main Street",
              addressMunicipality: undefined,
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ addressCity: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address city").value).toEqual("1010 Main Street");
      });

      it("renders addressCity from formation form data when addressMunicipality has empty sting values", () => {
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressCity: "1010 Main Street",
              addressMunicipality: generateMunicipality({ name: "" }),
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ addressCity: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address city").value).toEqual("1010 Main Street");
      });

      it("renders addressMunicipality from formation form data", () => {
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressCity: "",
              // used valid municipality from municipalities.json file
              addressMunicipality: generateMunicipality({
                displayName: "Newark",
                name: "Newark",
              }),
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ addressCity: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address city").value).toEqual("Newark");
      });

      it("renders address state from formation form data", () => {
        const addressState = generateUnitedStatesStateDropdownOption({});
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressState: addressState,
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressState: undefined,
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address state").value).toEqual(addressState.shortCode);
      });

      it("renders addressZipCode from formation form data", () => {
        const business = generateBusiness({
          formationData: generateFormationData({
            formationFormData: generateFormationFormData({
              addressZipCode: "12345",
            }),
          }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({ addressZipCode: "" }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Address zip code").value).toEqual("12345");
      });

      it("renders tax id from profile data", () => {
        const business = generateBusiness({
          profileData: generateProfileData({ taxId: "123456789123" }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            taxId: "",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Tax id").value).toEqual("123-456-789/123");
      });

      it("renders tax pin from profile data", () => {
        const business = generateBusiness({
          profileData: generateProfileData({ taxPin: "1234" }),
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            taxPin: "",
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(getInputElementByLabel("Tax pin").value).toEqual("1234");
      });
    });
  });

  it("saves userData when save and continue button is clicked on tab two", async () => {
    const business = generateBusiness({
      taxClearanceCertificateData: undefined,
      profileData: emptyProfileData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
    renderComponent({ business });
    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    expect(secondTab).toHaveAttribute("aria-selected", "true");

    selectComboboxValueByTextClick(
      "Tax clearance certificate requesting agency",
      LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
    );
    fillText("Business name", "Test Name");
    fillText("Address line1", "123 Test Road");
    fillText("Address line2", "Test Line 2");
    fillText("Address city", "Baltimore");

    selectComboboxValueByTextClick("Address state", "MD");
    fillText("Address zip code", "21210");
    fillText("Tax id", "012345678901");
    fillText("Tax pin", "1234");

    fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.saveButtonText));
    expect(currentBusiness().taxClearanceCertificateData).toEqual({
      requestingAgencyId: "newJerseyBoardOfPublicUtilities",
      businessName: "Test Name",
      addressLine1: "123 Test Road",
      addressLine2: "Test Line 2",
      addressCity: "Baltimore",
      addressState: { shortCode: "MD", name: "Maryland" },
      addressZipCode: "21210",
      taxId: "*******78901",
      encryptedTaxId: "encrypted-012345678901",
      taxPin: "****",
      encryptedTaxPin: "encrypted-1234",
      hasPreviouslyReceivedCertificate: false,
      lastUpdatedISO: undefined,
    });
  });

  it("saves userData when clicking from tab two to tab three", async () => {
    const business = generateBusiness({
      taxClearanceCertificateData: undefined,
      profileData: emptyProfileData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
    renderComponent({ business });
    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    expect(secondTab).toHaveAttribute("aria-selected", "true");

    selectComboboxValueByTextClick(
      "Tax clearance certificate requesting agency",
      LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
    );
    fillText("Business name", "Test Name");
    fillText("Address line1", "123 Test Road");
    fillText("Address line2", "Test Line 2");
    fillText("Address city", "Baltimore");

    selectComboboxValueByTextClick("Address state", "MD");
    fillText("Address zip code", "21210");
    fillText("Tax id", "012345678901");
    fillText("Tax pin", "1234");

    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    expect(thirdTab).toHaveAttribute("aria-selected", "true");
    expect(currentBusiness().taxClearanceCertificateData).toEqual({
      requestingAgencyId: "newJerseyBoardOfPublicUtilities",
      businessName: "Test Name",
      addressLine1: "123 Test Road",
      addressLine2: "Test Line 2",
      addressCity: "Baltimore",
      addressState: { shortCode: "MD", name: "Maryland" },
      addressZipCode: "21210",
      taxId: "*******78901",
      encryptedTaxId: "encrypted-012345678901",
      taxPin: "****",
      encryptedTaxPin: "encrypted-1234",
      hasPreviouslyReceivedCertificate: false,
      lastUpdatedISO: undefined,
    });
  });

  it("renders review main tax header", () => {
    const business = generateBusiness({
      taxClearanceCertificateData: undefined,
      profileData: emptyProfileData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
    renderComponent({ business });
    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    expect(thirdTab).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      Config.taxClearanceCertificateStep3.mainTitleHeader,
    );
  });

  describe("renders user selected data on review tab", () => {
    it("renders not started text when input is empty", () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      expect(
        within(screen.getByTestId("requestingAgencyId")).getByText(notStartedText),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("businessName")).getByText(notStartedText),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("addressLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("stateTaxIdLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("taxPinLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
    });

    it("renders not started text when addressLine1 is not filled out", async () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");
      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");

      selectComboboxValueByTextClick("Address state", "MD");
      fillText("Address zip code", "21210");
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      expect(
        within(screen.getByTestId("addressLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
    });

    it("renders not started text when address city is not filled out", async () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");

      selectComboboxValueByTextClick("Address state", "MD");
      fillText("Address zip code", "21210");
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      expect(
        within(screen.getByTestId("addressLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
    });

    it("renders not started text when addressState is not filled out", async () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");
      fillText("Address zip code", "21210");
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      expect(
        within(screen.getByTestId("addressLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
    });

    it("renders not started text when address zip code is not filled out", async () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");
      selectComboboxValueByTextClick("Address state", "MD");
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      expect(
        within(screen.getByTestId("addressLabel")).getByText(notStartedText),
      ).toBeInTheDocument();
    });

    it("renders formatted address when everything except addressLine2 is filled out", async () => {
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Address line1", "123 Test Road");
      fillText("Address city", "Baltimore");

      selectComboboxValueByTextClick("Address state", "MD");
      fillText("Address zip code", "21210");
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      const address = formatAddress({
        addressLine1: "123 Test Road",
        addressCity: "Baltimore",
        addressState: { shortCode: "MD", name: "Maryland" },
        addressZipCode: "21210",
      });

      expect(within(screen.getByTestId("addressLabel")).getByText(address)).toBeInTheDocument();
    });

    it("renders requesting agency text when all input is valid", async () => {
      const business = generateBusiness({
        taxClearanceCertificateData: generateTaxClearanceCertificateData({
          requestingAgencyId: undefined,
        }),
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      fireEvent.click(secondTab);
      expect(secondTab).toHaveAttribute("aria-selected", "true");

      selectComboboxValueByTextClick(
        "Tax clearance certificate requesting agency",
        LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
      );
      fillText("Business name", "Test Name");
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");

      selectComboboxValueByTextClick("Address state", "MD");
      fillText("Address zip code", "21210");
      fillText("Tax id", "012345678901");
      fillText("Tax pin", "1234");

      const address = formatAddress({
        addressLine1: "123 Test Road",
        addressLine2: "Test Line 2",
        addressCity: "Baltimore",
        addressState: { shortCode: "MD", name: "Maryland" },
        addressZipCode: "21210",
      });

      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      expect(
        within(screen.getByTestId("requestingAgencyId")).getByText(
          LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
        ),
      ).toBeInTheDocument();
      expect(within(screen.getByTestId("businessName")).getByText("Test Name")).toBeInTheDocument();
      expect(within(screen.getByTestId("addressLabel")).getByText(address)).toBeInTheDocument();
      expect(
        within(screen.getByTestId("stateTaxIdLabel")).getByText("*******78901"),
      ).toBeInTheDocument();
      expect(within(screen.getByTestId("taxPinLabel")).getByText("****")).toBeInTheDocument();
    });

    describe("renders errors on tax clearance step 2", () => {
      it("renders error for requestingAgency when empty and onBlur", async () => {
        const business = generateBusinessWithEmptyTaxClearanceData();
        renderComponent({ business });

        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(secondTab).toHaveAttribute("aria-selected", "true");

        const combobox = screen.getByRole("combobox", {
          name: "Tax clearance certificate requesting agency",
        });

        await userEvent.click(combobox);
        await userEvent.tab();
        await userEvent.tab(); // Double tab required to leave the MUI combobox

        await waitFor(() => {
          expect(
            screen.getByText(Config.taxClearanceCertificateShared.requestingAgencyErrorText),
          ).toBeInTheDocument();
        });
        await waitFor(() =>
          expect(
            within(screen.getByTestId("tax-clearance-error-alert")).getByText(
              Config.taxClearanceCertificateStep2.requestingAgencyLabel,
            ),
          ).toBeInTheDocument(),
        );
      });

      it("renders error for businessName when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({
            formationFormData: createEmptyFormationFormData(),
          }),
        });
        renderComponent({ business });

        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(secondTab).toHaveAttribute("aria-selected", "true");

        fillText("Business name", "");
        fireEvent.blur(screen.getByLabelText("Business name"));
        expect(
          screen.getByText(Config.taxClearanceCertificateShared.businessNameErrorText),
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("Business Name"),
        ).toBeInTheDocument();
      });

      it("renders error for taxId when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({
            formationFormData: createEmptyFormationFormData(),
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(secondTab).toHaveAttribute("aria-selected", "true");
        fillText("Tax id", "");
        fireEvent.blur(screen.getByLabelText("Tax id"));
        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired),
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("New Jersey Tax ID"),
        ).toBeInTheDocument();
      });

      it("renders error for taxPin when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({
            formationFormData: createEmptyFormationFormData(),
          }),
        });
        renderComponent({ business });
        const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
        fireEvent.click(secondTab);
        expect(secondTab).toHaveAttribute("aria-selected", "true");
        fillText("Tax pin", "");
        fireEvent.blur(screen.getByLabelText("Tax pin"));
        expect(
          screen.getByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired),
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("Tax PIN"),
        ).toBeInTheDocument();
      });
    });
  });

  it("makes the api post request", async () => {
    mockApi.postTaxClearanceCertificate.mockResolvedValue({
      certificatePdfArray: [],
      userData: generateUserData({}),
    });
    window.URL.createObjectURL = jest.fn();
    const business = generateBusiness({ id: "Faraz" });
    const userData = generateUserDataForBusiness(business);
    renderComponent({ userData });
    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    expect(thirdTab).toHaveAttribute("aria-selected", "true");

    fireEvent.click(
      screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
    );
    await waitFor(() => {
      const currentBusiness: Business = {
        ...userData.businesses[userData.currentBusinessId],
        lastUpdatedISO: expect.any(String),
      };
      expect(mockApi.postTaxClearanceCertificate).toHaveBeenCalledWith({
        ...userData,
        businesses: { ...userData.businesses, [currentBusiness.id]: currentBusiness },
      });
    });
  });

  it("renders locked address, business name, and taxId fields when business has formed", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
      }),
      formationData: generateFormationData({
        completedFilingPayment: true,
        formationFormData: generateFormationFormData({
          addressLine1: "123 Testing Road",
          addressLine2: "",
          addressMunicipality: generateMunicipality({ displayName: "Allendale" }),
          addressState: {
            name: "New Jersey",
            shortCode: "NJ",
          },
          addressZipCode: "07781",
          businessLocationType: "US",
        }),
      }),
      taxFilingData: {
        state: "SUCCESS",
        filings: [],
      },
    });
    renderComponent({ business });

    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    expect(secondTab).toHaveAttribute("aria-selected", "true");

    expect(screen.getByTestId("locked-businessName")).toBeInTheDocument();
    expect(screen.getByTestId("locked-profileAddressLine1")).toBeInTheDocument();
    expect(screen.getByTestId("locked-profileAddressCityStateZip")).toBeInTheDocument();
    expect(screen.getByTestId("disabled-taxid")).toBeInTheDocument();
  });

  it("renders the page to download the certificate when the API post request is successful", async () => {
    const pdfUrl = "blob:http://test-url";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockCreateObjectURL = jest.fn((_) => pdfUrl); // `_` is mean to be unused
    window.URL.createObjectURL = mockCreateObjectURL;
    mockApi.postTaxClearanceCertificate.mockResolvedValue({
      certificatePdfArray: [],
      userData: generateUserData({}),
    });
    renderComponent({});
    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    fireEvent.click(
      screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
    );
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        Config.taxClearanceCertificateDownload.headerTwoLabel,
      );
    });
    expect(mockCreateObjectURL).toHaveBeenLastCalledWith(expect.any(Blob));
    expect(screen.getByRole("link", { name: "Tax Clearance Certificate (PDF)" })).toHaveAttribute(
      "href",
      pdfUrl,
    );
  });

  it("renders error states when empty address field is blurred", async () => {
    const business = generateBusinessWithEmptyTaxClearanceData();
    renderComponent({ business });
    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);

    fireEvent.blur(screen.getByLabelText("Address line1"));
    expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
    expect(screen.getByText(Config.formation.fields.addressCity.error)).toBeInTheDocument();
    expect(screen.getByText(Config.formation.fields.addressState.error)).toBeInTheDocument();
    expect(
      screen.getByText(Config.formation.fields.addressZipCode.foreign.errorUS),
    ).toBeInTheDocument();
  });

  it("renders error icon when field is blurred", async () => {
    const business = generateBusinessWithEmptyTaxClearanceData();
    renderComponent({ business });
    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    fireEvent.blur(screen.getByLabelText("Address line1"));

    expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
  });

  describe("renders error from review tab when going to review tab directly", () => {
    it("renders address line 1 error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressLine1: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressLine1.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders address city error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressCity: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressCity.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders address state error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressState: undefined,
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressState.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders address zip code error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressZipCode: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressZipCode.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders requestingAgencyId error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        requestingAgencyId: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.taxClearanceCertificateStep2.requestingAgencyLabel,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders businessName error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        businessName: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.profileDefaults.fields.businessName.default.header,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders taxId error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        taxId: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.profileDefaults.fields.taxId.default.header,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders taxPin error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        taxPin: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.profileDefaults.fields.taxPin.default.header,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });
  });

  describe("renders error from review tab when going through check eligibility tab first", () => {
    it("renders address line 1 error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressLine1: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });

      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressLine1.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders address city error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressCity: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressCity.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders address state error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressState: undefined,
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressState.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders address zip code error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        addressZipCode: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.formation.fields.addressZipCode.label,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders requestingAgencyId error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        requestingAgencyId: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.taxClearanceCertificateStep2.requestingAgencyLabel,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders businessName error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        businessName: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.profileDefaults.fields.businessName.default.header,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders taxId error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        taxId: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.profileDefaults.fields.taxId.default.header,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });

    it("renders taxPin error when not entered", async () => {
      const business = generateBusinessWithEmptyProfileDataAndFormationDataData({
        taxPin: "",
      });

      renderComponent({ business });

      const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(secondTab);

      fireEvent.click(thirdTab);
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Incomplete"));
      expect(thirdTab).toHaveAttribute("aria-selected", "true");

      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );
      await waitFor(() =>
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText(
            Config.profileDefaults.fields.taxPin.default.header,
          ),
        ).toBeInTheDocument(),
      );
      expect(secondTab).toHaveAttribute("aria-label", expect.stringContaining("State: Error"));
    });
  });

  it.each([
    {
      type: "INELIGIBLE_TAX_CLEARANCE_FORM" as const,
      message: "Clean Tax Verification Failed.",
    },
    {
      type: "FAILED_TAX_ID_AND_PIN_VALIDATION" as const,
      message: "ADABase validation failed. Please verify the data submitted and retry.",
    },
    {
      type: "NATURAL_PROGRAM_ERROR" as const,
      message: "Error calling Natural Program. Please try again later.",
    },
    {
      type: "MISSING_FIELD" as const,
      message:
        "Mandatory Field Missing. TaxpayerId, TaxpayerName, AddressLine1, City, State, Zip, Agency name, Rep Id and RepName are required.",
    },
    {
      type: "TAX_ID_MISSING_FIELD" as const,
      message: "TaxpayerId is required.",
    },
    {
      type: "TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE" as const,
      message: "TaxpayerId  is required.",
    },
  ] as const)(
    "shows a generic error message when the API post request returns an error type $type",
    async (arg) => {
      const response: TaxClearanceCertificateResponse = {
        error: {
          type: arg.type as TaxClearanceCertificateResponseErrorType,
          message: arg.message,
        },
      };
      mockApi.postTaxClearanceCertificate.mockResolvedValue(response);
      renderComponent({});
      const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
      fireEvent.click(thirdTab);
      fireEvent.click(
        screen.getByRole("button", { name: Config.taxClearanceCertificateShared.saveButtonText }),
      );

      await waitFor(() => {
        expect(screen.getByTestId("tax-clearance-error-alert")).toBeInTheDocument();
      });
    },
  );

  it.each([
    "Business name",
    "Address line1",
    "Address line2",
    "Address city",
    "Address zip code",
    "Tax id",
    "Tax pin",
  ])("clears the error from submission when the text field %s is changed", async (fieldName) => {
    const response: TaxClearanceCertificateResponse = {
      error: {
        type: "INELIGIBLE_TAX_CLEARANCE_FORM" as TaxClearanceCertificateResponseErrorType,
        message: "Clean Tax Verification Failed.",
      },
    };
    mockApi.postTaxClearanceCertificate.mockResolvedValue(response);
    renderComponent({});

    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    const nextButton = screen.getByRole("button", {
      name: Config.taxClearanceCertificateShared.saveButtonText,
    });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId("tax-clearance-response-error")).toBeInTheDocument();
    });

    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    fillText(fieldName, "Test123456789012");
    expect(screen.queryByTestId("tax-clearance-response-error")).not.toBeInTheDocument();
  });

  it("clears the error from submission when a Requesting Agency dropdown selection is made", async () => {
    const response: TaxClearanceCertificateResponse = {
      error: {
        type: "INELIGIBLE_TAX_CLEARANCE_FORM" as TaxClearanceCertificateResponseErrorType,
        message: "Clean Tax Verification Failed.",
      },
    };
    mockApi.postTaxClearanceCertificate.mockResolvedValue(response);
    renderComponent({
      business: generateBusiness({
        taxClearanceCertificateData: generateTaxClearanceCertificateData({
          requestingAgencyId: "newJerseyRedevelopmentAuthority", // Ensures that the original requestingAgencyId is different from what we change it to
        }),
      }),
    });

    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    const nextButton = screen.getByRole("button", {
      name: Config.taxClearanceCertificateShared.saveButtonText,
    });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId("tax-clearance-error-alert")).toBeInTheDocument();
    });
    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    selectComboboxValueByTextClick(
      "Tax clearance certificate requesting agency",
      LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name,
    );

    expect(screen.queryByTestId("tax-clearance-error-alert")).not.toBeInTheDocument();
  });

  it("clears the error from submission when a State dropdown selection is made", async () => {
    const response: TaxClearanceCertificateResponse = {
      error: {
        type: "INELIGIBLE_TAX_CLEARANCE_FORM" as TaxClearanceCertificateResponseErrorType,
        message: "Clean Tax Verification Failed.",
      },
    };
    mockApi.postTaxClearanceCertificate.mockResolvedValue(response);
    renderComponent({
      business: generateBusiness({
        taxClearanceCertificateData: generateTaxClearanceCertificateData({
          addressState: { shortCode: "NJ", name: "New Jersey" } as StateObject, // Ensures that the original addressState is different from what we change it to
        }),
      }),
    });

    const thirdTab = screen.getByRole("tab", { name: /Review Step/ });
    fireEvent.click(thirdTab);
    const nextButton = screen.getByRole("button", {
      name: Config.taxClearanceCertificateShared.saveButtonText,
    });
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(screen.getByTestId("tax-clearance-error-alert")).toBeInTheDocument();
    });
    const secondTab = screen.getByRole("tab", { name: /Check Eligibility Step/ });
    fireEvent.click(secondTab);
    selectComboboxValueByTextClick("Address state", "MD");

    expect(screen.queryByTestId("tax-clearance-error-alert")).not.toBeInTheDocument();
  });
});
