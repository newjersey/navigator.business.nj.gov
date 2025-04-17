import { AnytimeActionTaxClearanceCertificateElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateElement";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { formatAddress } from "@/lib/domain-logic/formatAddress";
import { generateAnytimeActionTask } from "@/test/factories";
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
  generateUserDataForBusiness,
  getTaxClearanceCertificateAgencies,
  LookupTaxClearanceCertificateAgenciesById,
  randomElementFromArray,
} from "@businessnjgovnavigator/shared";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";
import * as materialUi from "@mui/material";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

jest.mock("@/lib/api-client/apiClient", () => ({ postTaxClearanceCertificate: jest.fn() }));
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

describe("<AnyTimeActionTaxClearanceCertificateReviewElement />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    setupStatefulUserDataContext();
  });

  const anytimeAction = generateAnytimeActionTask({
    filename: "tax-clearance-certificate",
    name: "header",
  });

  const renderComponent = ({ business, userData }: { business?: Business; userData?: UserData }): void => {
    render(
      <WithStatefulUserData
        initialUserData={userData || generateUserDataForBusiness(business || generateBusiness({}))}
      >
        <AnytimeActionTaxClearanceCertificateElement anytimeAction={anytimeAction} />
      </WithStatefulUserData>
    );
  };

  const generateBusinessWithEmptyTaxClearanceData = (): Business => {
    return generateBusiness({
      profileData: generateProfileData({ businessName: "", taxId: undefined, taxPin: undefined }),
      taxClearanceCertificateData: emptyTaxClearanceCertificateData,
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
      expect(screen.getByTestId("requirements-tab")).toBeInTheDocument();
    });

    it("renders the eligibility tab on click", () => {
      renderComponent({});
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
    });

    it("renders the review tab on click", () => {
      renderComponent({});
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();
    });

    it("renders back to tab one when the back button is clicked on tab 2", () => {
      renderComponent({});
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.backButtonText));
      expect(screen.getByTestId("requirements-tab")).toBeInTheDocument();
    });

    it("renders tab three when the save button is clicked on tab two", () => {
      renderComponent({});
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.saveButtonText));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();
    });

    it("renders back to tab two when the back button is clicked on tab three", () => {
      renderComponent({});
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateShared.backButtonText));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
    });

    it("renders back to tab two when the back edit button is clicked on tab three", () => {
      renderComponent({});
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();
      fireEvent.click(screen.getByText(Config.taxClearanceCertificateStep3.editButtonText));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
    });

    it("renders the first step as complete only when on the eligibility or review tab", () => {
      renderComponent({});
      expect(screen.getByTestId(`stepper-0`).dataset.state).toEqual("INCOMPLETE-ACTIVE");
      fireEvent.click(screen.getByTestId("stepper-1"));

      expect(screen.getByTestId(`stepper-0`).dataset.state).toEqual("COMPLETE");

      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId(`stepper-0`).dataset.state).toEqual("COMPLETE");

      fireEvent.click(screen.getByTestId("stepper-0"));
      expect(screen.getByTestId(`stepper-0`).dataset.state).toEqual("INCOMPLETE-ACTIVE");
    });

    it("renders the second step as incomplete until all required fields are non empty and valid", () => {
      renderComponent({ business: generateBusinessWithEmptyTaxClearanceData() });
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE");

      fireEvent.click(screen.getByTestId("stepper-1"));

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      fillText("Business name", "Test Name");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      fillText("Address line1", "123 Test Road");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      fillText("Address city", "Baltimore");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      selectValueByTestId("addressState", "MD");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      fillText("Address zip code", "21210");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      fillText("Tax id", "012345678901");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");

      fillText("Tax pin", "1234");
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("COMPLETE-ACTIVE");
    });

    it.each(["Zip Code", "Tax ID", "Tax PIN"])(
      "renders the second step as incomplete when all fields are non empty but the %s field does not have enough digits",
      (incompleteField) => {
        renderComponent({ business: generateBusinessWithEmptyTaxClearanceData() });
        expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE");

        fireEvent.click(screen.getByTestId("stepper-1"));

        selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
        fillText("Business name", "Test Name");
        fillText("Address line1", "123 Test Road");
        fillText("Address city", "Baltimore");
        selectValueByTestId("addressState", "MD");
        fillText("Address zip code", incompleteField === "Zip Code" ? "0" : "21210");
        fillText("Tax id", incompleteField === "Tax ID" ? "0" : "012345678901");
        fillText("Tax pin", incompleteField === "Tax PIN" ? "0" : "1234");

        expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");
      }
    );

    it.each([
      "Requesting Agency",
      "Business Name",
      "Address Line 1",
      "Address City",
      "Address State",
      "Zip Code",
      "Tax ID",
      "Tax PIN",
    ])("renders the second step as incomplete when all fields are non empty except for %s", (emptyField) => {
      renderComponent({ business: generateBusinessWithEmptyTaxClearanceData() });
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE");

      fireEvent.click(screen.getByTestId("stepper-1"));

      if (emptyField !== "Requesting Agency") {
        selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      }
      if (emptyField !== "Business Name") {
        fillText("Business name", "Test Name");
      }
      if (emptyField !== "Address Line 1") {
        fillText("Address line1", "123 Test Road");
      }
      if (emptyField !== "Address City") {
        fillText("Address city", "Baltimore");
      }

      if (emptyField !== "Address State") {
        selectValueByTestId("addressState", "MD");
      }
      if (emptyField !== "Zip Code") {
        fillText("Address zip code", "21210");
      }
      if (emptyField !== "Tax ID") {
        fillText("Tax id", "012345678901");
      }
      if (emptyField !== "Tax PIN") {
        fillText("Tax pin", "1234");
      }
      expect(screen.getByTestId(`stepper-1`).dataset.state).toEqual("INCOMPLETE-ACTIVE");
    });
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
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(screen.getByText(agencyId.name)).toBeInTheDocument();
      });

      it("renders business name", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            businessName: "business name in taxClearanceCertificateData",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Business name").value).toEqual(
          "business name in taxClearanceCertificateData"
        );
      });

      it("renders addressLine1", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressLine1: "1010 Main Street",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Address line1").value).toEqual("1010 Main Street");
      });

      it("renders addressLine2", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressLine2: "1010 Main Street",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Address line2").value).toEqual("1010 Main Street");
      });

      it("renders city", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressCity: "1010 Main Street",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Address state").value).toEqual(addressState.shortCode);
      });

      it("renders zip code", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            addressZipCode: "12345",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Address zip code").value).toEqual("12345");
      });

      it("renders tax id", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            taxId: "123456789123",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Tax id").value).toEqual("123-456-789/123");
      });

      it("renders tax pin", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: generateTaxClearanceCertificateData({
            taxPin: "1234",
          }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Business name").value).toEqual("business name in profile data");
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
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
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(getInputElementByLabel("Tax pin").value).toEqual("1234");
      });
    });
  });

  it("saves userData when save and continue button is clicked on tab two", () => {
    const business = generateBusiness({
      taxClearanceCertificateData: undefined,
      profileData: emptyProfileData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
    renderComponent({ business });
    fireEvent.click(screen.getByTestId("stepper-1"));
    expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

    selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
    fillText("Business name", "Test Name");
    fillText("Address line1", "123 Test Road");
    fillText("Address line2", "Test Line 2");
    fillText("Address city", "Baltimore");

    selectValueByTestId("addressState", "MD");
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
      taxId: "012345678901",
      taxPin: "1234",
    });
  });

  it("saves userData when clicking from tab two to tab three", () => {
    const business = generateBusiness({
      taxClearanceCertificateData: undefined,
      profileData: emptyProfileData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
    renderComponent({ business });
    fireEvent.click(screen.getByTestId("stepper-1"));
    expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

    selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
    fillText("Business name", "Test Name");
    fillText("Address line1", "123 Test Road");
    fillText("Address line2", "Test Line 2");
    fillText("Address city", "Baltimore");

    selectValueByTestId("addressState", "MD");
    fillText("Address zip code", "21210");
    fillText("Tax id", "012345678901");
    fillText("Tax pin", "1234");

    fireEvent.click(screen.getByTestId("stepper-2"));
    expect(screen.getByTestId("review-tab")).toBeInTheDocument();
    expect(currentBusiness().taxClearanceCertificateData).toEqual({
      requestingAgencyId: "newJerseyBoardOfPublicUtilities",
      businessName: "Test Name",
      addressLine1: "123 Test Road",
      addressLine2: "Test Line 2",
      addressCity: "Baltimore",
      addressState: { shortCode: "MD", name: "Maryland" },
      addressZipCode: "21210",
      taxId: "012345678901",
      taxPin: "1234",
    });
  });

  it("renders review main tax header", () => {
    const business = generateBusiness({
      taxClearanceCertificateData: undefined,
      profileData: emptyProfileData,
      formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
    });
    renderComponent({ business });
    fireEvent.click(screen.getByTestId("stepper-2"));
    expect(screen.getByTestId("review-tab")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("review-tab")).getByText(Config.taxClearanceCertificateStep3.mainTitleHeader)
    ).toBeInTheDocument();
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
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      expect(within(screen.getByTestId("requestingAgencyId")).getByText(notStartedText)).toBeInTheDocument();
      expect(within(screen.getByTestId("businessName")).getByText(notStartedText)).toBeInTheDocument();
      expect(within(screen.getByTestId("addressLabel")).getByText(notStartedText)).toBeInTheDocument();
      expect(within(screen.getByTestId("stateTaxIdLabel")).getByText(notStartedText)).toBeInTheDocument();
      expect(within(screen.getByTestId("taxPinLabel")).getByText(notStartedText)).toBeInTheDocument();
    });

    it("renders not started text when addressLine1 is not filled out", () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");

      selectValueByTestId("addressState", "MD");
      fillText("Address zip code", "21210");
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      expect(within(screen.getByTestId("addressLabel")).getByText(notStartedText)).toBeInTheDocument();
    });

    it("renders not started text when address city is not filled out", () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");

      selectValueByTestId("addressState", "MD");
      fillText("Address zip code", "21210");
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      expect(within(screen.getByTestId("addressLabel")).getByText(notStartedText)).toBeInTheDocument();
    });

    it("renders not started text when addressState is not filled out", () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");
      fillText("Address zip code", "21210");
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      expect(within(screen.getByTestId("addressLabel")).getByText(notStartedText)).toBeInTheDocument();
    });

    it("renders not started text when address zip code is not filled out", () => {
      const notStartedText = Config.formation.general.notEntered;
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");
      selectValueByTestId("addressState", "MD");
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      expect(within(screen.getByTestId("addressLabel")).getByText(notStartedText)).toBeInTheDocument();
    });

    it("renders formatted address when everything except addressLine2 is filled out", () => {
      const business = generateBusiness({
        taxClearanceCertificateData: undefined,
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      fillText("Address line1", "123 Test Road");
      fillText("Address city", "Baltimore");

      selectValueByTestId("addressState", "MD");
      fillText("Address zip code", "21210");
      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      const address = formatAddress({
        addressLine1: "123 Test Road",
        addressCity: "Baltimore",
        addressState: { shortCode: "MD", name: "Maryland" },
        addressZipCode: "21210",
      });

      expect(within(screen.getByTestId("addressLabel")).getByText(address)).toBeInTheDocument();
    });

    it("renders requesting agency text when all input is valid", () => {
      const business = generateBusiness({
        taxClearanceCertificateData: generateTaxClearanceCertificateData({
          requestingAgencyId: undefined,
        }),
        profileData: emptyProfileData,
        formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      });
      renderComponent({ business });
      fireEvent.click(screen.getByTestId("stepper-1"));
      expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();

      selectValueByLabel("Tax clearance certificate requesting agency", "newJerseyBoardOfPublicUtilities");
      fillText("Business name", "Test Name");
      fillText("Address line1", "123 Test Road");
      fillText("Address line2", "Test Line 2");
      fillText("Address city", "Baltimore");

      selectValueByTestId("addressState", "MD");
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

      fireEvent.click(screen.getByTestId("stepper-2"));
      expect(screen.getByTestId("review-tab")).toBeInTheDocument();

      expect(
        within(screen.getByTestId("requestingAgencyId")).getByText(
          LookupTaxClearanceCertificateAgenciesById("newJerseyBoardOfPublicUtilities").name
        )
      ).toBeInTheDocument();
      expect(within(screen.getByTestId("businessName")).getByText("Test Name")).toBeInTheDocument();
      expect(within(screen.getByTestId("addressLabel")).getByText(address)).toBeInTheDocument();
      expect(within(screen.getByTestId("stateTaxIdLabel")).getByText("012345678901")).toBeInTheDocument();
      expect(within(screen.getByTestId("taxPinLabel")).getByText("1234")).toBeInTheDocument();
    });

    describe("renders data when input is provided", () => {});

    describe("renders errors on tax clearance step 2", () => {
      // it("renders all errors when no input and on click of submit", () => {
      //   const business = generateBusiness({
      //     taxClearanceCertificateData: undefined,
      //     profileData: emptyProfileData,
      //     formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      //   });
      //   renderComponent(business);
      //   fireEvent.click(screen.getByTestId("stepper-1"));
      //   expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
      //   //fireEvent.blur(screen.getByLabelText("Business name"));
      //   fireEvent.click(screen.getByTestId("next-button"));
      //   expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
      //
      //   expect(
      //     within(screen.getByTestId("tax-clearance-error-alert")).getByText("Requesting Agency")
      //   ).toBeInTheDocument();
      //   expect(
      //     within(screen.getByTestId("tax-clearance-error-alert")).getByText("Business Name")
      //   ).toBeInTheDocument();
      //   expect(
      //     within(screen.getByTestId("tax-clearance-error-alert")).getByText("New Jersey Tax ID")
      //   ).toBeInTheDocument();
      //   expect(
      //     within(screen.getByTestId("tax-clearance-error-alert")).getByText("Tax PIN")
      //   ).toBeInTheDocument();
      // });

      // it("renders error for addressLine1 onBlur", () => {
      //   const business = generateBusiness({
      //     taxClearanceCertificateData: undefined,
      //     profileData: emptyProfileData,
      //     formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
      //   });
      //   renderComponent(business);
      //   fireEvent.click(screen.getByTestId("stepper-1"));
      //   expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
      //   fillText("Address line1", "");
      //   fireEvent.blur(screen.getByLabelText("Address line1"));
      //   expect(screen.getByText(Config.formation.fields.addressLine1.error)).toBeInTheDocument();
      //   expect(
      //     within(screen.getByTestId("tax-clearance-error-alert")).getByText("Address Line 1")
      //   ).toBeInTheDocument();
      // });

      it("renders error for requestingAgency when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
        fireEvent.blur(screen.getByLabelText("Tax clearance certificate requesting agency"));
        expect(
          screen.getByText(Config.taxClearanceCertificateShared.requestingAgencyErrorText)
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("Requesting Agency")
        ).toBeInTheDocument();
      });

      it("renders error for businessName when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
        fillText("Business name", "");
        fireEvent.blur(screen.getByLabelText("Business name"));
        expect(
          screen.getByText(Config.taxClearanceCertificateShared.businessNameErrorText)
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("Business Name")
        ).toBeInTheDocument();
      });

      it("renders error for taxId when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
        fillText("Tax id", "");
        fireEvent.blur(screen.getByLabelText("Tax id"));
        expect(
          screen.getByText(Config.profileDefaults.fields.taxId.default.errorTextRequired)
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("New Jersey Tax ID")
        ).toBeInTheDocument();
      });

      it("renders error for taxPin when empty and onBlur", () => {
        const business = generateBusiness({
          taxClearanceCertificateData: undefined,
          profileData: emptyProfileData,
          formationData: generateFormationData({ formationFormData: createEmptyFormationFormData() }),
        });
        renderComponent({ business });
        fireEvent.click(screen.getByTestId("stepper-1"));
        expect(screen.getByTestId("eligibility-tab")).toBeInTheDocument();
        fillText("Tax pin", "");
        fireEvent.blur(screen.getByLabelText("Tax pin"));
        expect(
          screen.getByText(Config.profileDefaults.fields.taxPin.default.errorTextRequired)
        ).toBeInTheDocument();
        expect(
          within(screen.getByTestId("tax-clearance-error-alert")).getByText("Tax PIN")
        ).toBeInTheDocument();
      });
    });
  });

  it("makes the api post request", async () => {
    mockApi.postTaxClearanceCertificate.mockResolvedValue({
      certificatePdfArray: [],
    });
    window.URL.createObjectURL = jest.fn();
    const business = generateBusiness({ id: "Faraz" });
    const userData = generateUserDataForBusiness(business);
    renderComponent({ userData });
    fireEvent.click(screen.getByTestId("stepper-2"));
    expect(screen.getByTestId("review-tab")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("next-button"));
    await waitFor(() => {
      expect(mockApi.postTaxClearanceCertificate).toHaveBeenCalledWith(userData);
    });
  });

  it("renders the page to download the certificate when the API post request is successful", async () => {
    const pdfUrl = "blob:http://test-url";
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockCreateObjectURL = jest.fn((_) => pdfUrl); // `_` is mean to be unused
    window.URL.createObjectURL = mockCreateObjectURL;
    mockApi.postTaxClearanceCertificate.mockResolvedValue({
      certificatePdfArray: [],
    });
    renderComponent({});
    fireEvent.click(screen.getByTestId("stepper-2"));
    fireEvent.click(screen.getByTestId("next-button"));

    await waitFor(() => {
      expect(screen.getByTestId("download-page")).toBeInTheDocument();
    });
    expect(mockCreateObjectURL).toHaveBeenLastCalledWith(expect.any(Blob));
    expect(screen.getByRole("link", { name: "Tax Clearance Certificate (PDF)" })).toHaveAttribute(
      "href",
      pdfUrl
    );
  });

  const getInputElementByLabel = (label: string): HTMLInputElement => {
    return screen.getByLabelText(label) as HTMLInputElement;
  };

  const fillText = (label: string, value: string): void => {
    fireEvent.change(screen.getByLabelText(label), { target: { value: value } });
    fireEvent.blur(screen.getByLabelText(label));
  };

  const selectValueByTestId = (dataTestId: string, value: string): void => {
    fireEvent.click(screen.getByTestId(dataTestId));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };

  const selectValueByLabel = (label: string, value: string): void => {
    expect(screen.getByLabelText(label)).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByLabelText(label));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const listbox = within(screen.getByRole("listbox"));
    fireEvent.click(listbox.getByTestId(value));
  };
});
