import { defaultDisplayDateFormat } from "@/lib/types/types";
import {
  generateFormationDbaContent,
  generateFormationDisplayContent,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { markdownToText } from "@/test/helpers/helpers-utilities";
import { mockPush } from "@/test/mock/mockRouter";
import { currentUserData } from "@/test/mock/withStatefulUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  castPublicFilingLegalTypeToFormationType,
  defaultDateFormat,
  FormationFormData,
  generateFormationFormData,
  generateMunicipality,
  getCurrentDate,
  getCurrentDateFormatted,
  Municipality,
  ProfileData,
  PublicFilingLegalType,
  randomPublicFilingLegalType,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

jest.mock("@mui/material", () => mockMaterialUI());
jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/data-hooks/useDocuments");
jest.mock("next/router", () => ({ useRouter: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: jest.fn(),
  getCompletedFiling: jest.fn(),
  searchBusinessName: jest.fn(),
}));

describe("Formation - BusinessStep", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    formationFormData: Partial<FormationFormData>,
    municipalities?: Municipality[]
  ): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData(initialProfileData);
    const isForeign = initialProfileData.businessPersona == "FOREIGN";
    const formationData = {
      formationFormData: generateFormationFormData(formationFormData, {
        legalStructureId: castPublicFilingLegalTypeToFormationType(
          profileData.legalStructureId as PublicFilingLegalType,
          initialProfileData.businessPersona
        ),
      }),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    };
    const page = preparePage(
      generateUserData({ profileData, formationData }),
      {
        formationDisplayContent: generateFormationDisplayContent({}),
        formationDbaContent: generateFormationDbaContent({}),
      },
      municipalities
    );
    if (isForeign) {
      await page.submitNexusBusinessNameStep();
    } else {
      await page.stepperClickToBusinessStep();
    }
    return page;
  };

  it("displays modal when legal structure Edit button clicked", async () => {
    await getPageHelper({}, {});
    expect(
      screen.queryByText(Config.businessFormationDefaults.legalStructureWarningModalHeader)
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("edit-legal-structure"));
    expect(
      screen.getByText(Config.businessFormationDefaults.legalStructureWarningModalHeader)
    ).toBeInTheDocument();
  });

  it("displays jurisdiction alert info box", async () => {
    await getPageHelper({}, {});
    expect(
      screen.getByText(markdownToText(Config.businessFormationDefaults.businessLocationInfoAlertMarkdown))
    ).toBeInTheDocument();
  });

  it("routes to profile page when edit legal structure button is clicked", async () => {
    await getPageHelper({}, {});

    fireEvent.click(screen.getByTestId("edit-legal-structure"));
    fireEvent.click(
      within(screen.getByTestId("modal-content")).getByText(
        Config.businessFormationDefaults.legalStructureWarningModalContinueButtonText
      )
    );
    expect(mockPush).toHaveBeenCalledWith("/profile?path=businessFormation");
  });

  it("auto-fills fields from userData if it exists as an LLC", async () => {
    const page = await getPageHelper(
      {
        legalStructureId: "limited-liability-company",
        municipality: generateMunicipality({ displayName: "Newark", name: "Newark" }),
      },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
        addressLine1: "123 main street",
        addressLine2: "suite 102",
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressZipCode: "07601",
        businessPurpose: "some cool purpose",
      }
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Address municipality").value).toBe("Newark");
    expect(page.getInputElementByLabel("Address state").value).toBe("NJ");
    expect(page.getInputElementByLabel("Address zip code").value).toBe("07601");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("auto-fills fields from userData if it exists as an US-based FLC", async () => {
    const page = await getPageHelper(
      {
        legalStructureId: "limited-liability-company",
        businessPersona: "FOREIGN",
      },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
        businessLocationType: "US",
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
        foreignStateOfFormation: "Virgin Islands",
        addressLine1: "123 main street",
        addressLine2: "suite 102",
        addressState: { shortCode: "DC", name: "District of Columbia" },
        addressZipCode: "20011",
        addressCity: "Washington",
        businessPurpose: "some cool purpose",
      }
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign date of formation").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign state of formation").value).toBe("Virgin Islands");
    expect(page.getInputElementByLabel("Address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Address city").value).toBe("Washington");
    expect(page.getInputElementByLabel("Address state").value).toBe("DC");
    expect(page.getInputElementByLabel("Address zip code").value).toBe("20011");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("auto-fills fields from userData if it exists as an INTL-based FLC", async () => {
    const page = await getPageHelper(
      {
        legalStructureId: "limited-liability-company",
        businessPersona: "FOREIGN",
      },
      {
        businessSuffix: "LTD LIABILITY CO",
        businessStartDate: getCurrentDateFormatted(defaultDateFormat),
        businessLocationType: "INTL",
        foreignDateOfFormation: getCurrentDateFormatted(defaultDateFormat),
        foreignStateOfFormation: "Virgin Islands",
        addressLine1: "123 main street",
        addressLine2: "suite 102",
        addressProvince: "Bordeaux",
        addressCountry: "FR",
        addressZipCode: "2033011",
        addressCity: "Paris",
        businessPurpose: "some cool purpose",
      }
    );

    expect(screen.getByText("LTD LIABILITY CO")).toBeInTheDocument();
    expect(page.getInputElementByLabel("Business start date").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign date of formation").value).toBe(
      getCurrentDateFormatted(defaultDisplayDateFormat)
    );
    expect(page.getInputElementByLabel("Foreign state of formation").value).toBe("Virgin Islands");
    expect(page.getInputElementByLabel("Address line1").value).toBe("123 main street");
    expect(page.getInputElementByLabel("Address line2").value).toBe("suite 102");
    expect(page.getInputElementByLabel("Address country").value).toBe("France");
    expect(page.getInputElementByLabel("Address city").value).toBe("Paris");
    expect(page.getInputElementByLabel("Address province").value).toBe("Bordeaux");
    expect(page.getInputElementByLabel("Address zip code").value).toBe("2033011");
    expect(page.getInputElementByLabel("Business purpose").value).toBe("some cool purpose");
  });

  it("does not display dependency alert", async () => {
    await getPageHelper({}, {});
    expect(screen.queryByTestId("dependency-alert")).not.toBeInTheDocument();
  });

  it("goes back to name step when edit business name button is clicked", async () => {
    await getPageHelper({}, {});
    fireEvent.click(screen.getByTestId("edit-business-name"));
    expect(screen.getByTestId("business-name-step")).toBeInTheDocument();
  });

  it("displays alert and highlights fields when blur with missing fields", async () => {
    const page = await getPageHelper({}, { addressLine1: "" });

    fireEvent.blur(screen.getByLabelText("Address line1"));

    expect(screen.getByText(Config.businessFormationDefaults.addressLine1ErrorText)).toBeInTheDocument();
    page.fillText("Address line1", "1234 main street");
    expect(
      screen.queryByText(Config.businessFormationDefaults.addressLine1ErrorText)
    ).not.toBeInTheDocument();
  });

  describe("Business purpose", () => {
    it("keeps business purpose closed by default", async () => {
      await getPageHelper({}, { businessPurpose: "" });
      expect(screen.getByText(Config.businessFormationDefaults.businessPurposeTitle)).toBeInTheDocument();
      expect(
        screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("remove business purpose")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Business purpose")).not.toBeInTheDocument();
    });

    it("shows business purpose open if exists", async () => {
      await getPageHelper({}, { businessPurpose: "some purpose" });
      expect(
        screen.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove business purpose")).toBeInTheDocument();
      expect(screen.getByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("opens business purpose when Add button clicked", async () => {
      await getPageHelper({}, { businessPurpose: "" });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));

      expect(
        screen.queryByText(Config.businessFormationDefaults.businessPurposeAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove business purpose")).toBeInTheDocument();
      expect(screen.getByLabelText("Business purpose")).toBeInTheDocument();
    });

    it("removes business purpose when Remove button clicked", async () => {
      const page = await getPageHelper({}, { businessPurpose: "some purpose" });
      fireEvent.click(screen.getByLabelText("remove business purpose"));
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.businessPurpose).toEqual("");
    });

    it("updates char count in real time", async () => {
      const page = await getPageHelper({}, { businessPurpose: "" });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.businessPurposeAddButtonText));
      expect(screen.getByText("0 / 300", { exact: false })).toBeInTheDocument();
      page.fillText("Business purpose", "some purpose");
      const charLength = "some purpose".length;
      expect(screen.getByText(`${charLength} / 300`, { exact: false })).toBeInTheDocument();
    });
  });

  describe("provisions", () => {
    it("hides provisions when forming as a foreign business and the legalStructureId is not foreign-limited-partnership", async () => {
      await getPageHelper(
        {
          businessPersona: "FOREIGN",
          legalStructureId: randomPublicFilingLegalType((value) => value != "limited-partnership"),
        },
        { provisions: [] }
      );
      expect(screen.queryByText(Config.businessFormationDefaults.provisionsTitle)).not.toBeInTheDocument();
    });

    it("shows provisions when forming as a foreign business and the legalStructureId is foreign-limited-partnership", async () => {
      await getPageHelper(
        {
          businessPersona: "FOREIGN",
          legalStructureId: randomPublicFilingLegalType((value) => value == "limited-partnership"),
        },
        { provisions: [] }
      );
      expect(screen.getByText(Config.businessFormationDefaults.provisionsTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText)).toBeInTheDocument();
      expect(screen.queryByLabelText("remove provision")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("provision 0")).not.toBeInTheDocument();
    });

    it("keeps provisions closed by default when page loads", async () => {
      await getPageHelper({}, { provisions: [] });
      expect(screen.getByText(Config.businessFormationDefaults.provisionsTitle)).toBeInTheDocument();
      expect(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText)).toBeInTheDocument();
      expect(screen.queryByLabelText("remove provision")).not.toBeInTheDocument();
      expect(screen.queryByLabelText("provision 0")).not.toBeInTheDocument();
    });

    it("shows provisions open if exists", async () => {
      await getPageHelper({}, { provisions: ["provision1", "provision2"] });
      expect(
        screen.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("opens provisions when Add button clicked", async () => {
      await getPageHelper({}, { provisions: [] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));

      expect(
        screen.queryByText(Config.businessFormationDefaults.provisionsAddButtonText)
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("remove provision")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
    });

    it("adds more provisions when Add More button clicked", async () => {
      await getPageHelper({}, { provisions: [] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      expect(screen.queryAllByLabelText("remove provision")).toHaveLength(2);
      expect(screen.getByLabelText("Provisions 0")).toBeInTheDocument();
      expect(screen.getByLabelText("Provisions 1")).toBeInTheDocument();
    });

    it("removes correct provision when Remove button clicked", async () => {
      const page = await getPageHelper(
        {},
        {
          provisions: ["provision1", "provision2", "provision3"],
        }
      );
      const removeProvision2Button = screen.getAllByLabelText("remove provision")[1];
      fireEvent.click(removeProvision2Button);
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.provisions).toEqual([
        "provision1",
        "provision3",
      ]);
    });

    it("updates char count in real time", async () => {
      const page = await getPageHelper({}, { provisions: [] });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddButtonText));
      expect(screen.getByText("0 / 3000", { exact: false })).toBeInTheDocument();
      page.fillText("Provisions 0", "some provision");
      const charLength = "some provision".length;
      expect(screen.getByText(`${charLength} / 3000`, { exact: false })).toBeInTheDocument();
    });

    it("does not allow adding more than 10 provisions", async () => {
      const nineProvisions = Array(9).fill("some provision");
      await getPageHelper({}, { provisions: nineProvisions });
      fireEvent.click(screen.getByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText));
      expect(
        screen.queryByText(Config.businessFormationDefaults.provisionsAddAnotherButtonText)
      ).not.toBeInTheDocument();
    });
  });

  describe("Foreign state of formation", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { foreignStateOfFormation: undefined }
      );
      page.fillText("Foreign state of formation", "Virgin Islands");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.foreignStateOfFormation).toEqual(
        "Virgin Islands"
      );
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { foreignStateOfFormation: undefined }
      );
      page.fillText("Foreign state of formation", "test");
      expect(
        screen.getByText(Config.businessFormationDefaults.foreignStateOfFormationErrorText)
      ).toBeInTheDocument();
    });
  });

  describe("Business location type radio buttons", () => {
    it("switches between location types", async () => {
      await getPageHelper({ businessPersona: "FOREIGN" }, { businessLocationType: "US" });
      fireEvent.click(screen.getByTestId("address-radio-intl"));
      expect(screen.getByLabelText("Address country")).toBeInTheDocument();
    });

    it("resets address data on switch", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { businessLocationType: "US" });
      page.fillText("Address line1", "test12345");
      fireEvent.click(screen.getByTestId("address-radio-intl"));
      expect(screen.queryByText("test12345")).not.toBeInTheDocument();
    });
  });

  describe("Address country", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address country", "Canada");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.addressCountry).toEqual("CA");
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address country", "test");
      expect(screen.getByText(Config.businessFormationDefaults.addressCountryErrorText)).toBeInTheDocument();
    });
  });

  describe("Address province", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressProvince: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address province", "Quebec");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.addressProvince).toEqual("Quebec");
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      page.fillText("Address province", "");
      expect(screen.getByText(Config.businessFormationDefaults.addressProvinceErrorText)).toBeInTheDocument();
    });
  });

  describe("Address city", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { addressCity: undefined });
      page.fillText("Address city", "Quebec");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.addressCity).toEqual("Quebec");
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { addressCity: undefined });
      page.fillText("Address city", "");
      expect(screen.getByText(Config.businessFormationDefaults.addressCityErrorText)).toBeInTheDocument();
    });
  });

  describe("Address state", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressState: undefined, businessLocationType: "US" }
      );
      page.fillText("Address state", "AL");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.addressState).toEqual({
        name: "Alabama",
        shortCode: "AL",
      });
    });

    it("displays error on field validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressState: undefined, businessLocationType: "US" }
      );
      page.fillText("Address state", "");
      expect(screen.getByText(Config.businessFormationDefaults.addressStateErrorText)).toBeInTheDocument();
    });
  });

  describe("Business total stock", () => {
    it("saves data to formationData", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      page.fillText("Business total stock", "123");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.businessTotalStock).toEqual("123");
    });

    it("trims leading zeros", async () => {
      const page = await getPageHelper(
        { legalStructureId: "c-corporation" },
        { businessTotalStock: undefined }
      );
      page.fillText("Business total stock", "0123");
      await page.submitBusinessStep(true);
      expect(currentUserData().formationData.formationFormData.businessTotalStock).toEqual("123");
    });
  });

  describe("NJ zipCode validation", () => {
    it("displays error message when non-NJ zipCode is entered in main Address", async () => {
      const page = await getPageHelper({}, { addressZipCode: "" });
      page.fillText("Address zip code", "22222");
      expect(screen.getByText(Config.businessFormationDefaults.addressZipCodeErrorText)).toBeInTheDocument();
    });

    it("displays error message when non-numeric zipCode is entered in main Address", async () => {
      const page = await getPageHelper({}, { addressZipCode: "" });
      page.fillText("Address zip code", "AAAAA");
      expect(screen.getByText(Config.businessFormationDefaults.addressZipCodeErrorText)).toBeInTheDocument();
    });

    it("passes zipCode validation in main Address", async () => {
      const page = await getPageHelper({}, { addressZipCode: "" });
      page.fillText("Address zip code", "07001");
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.addressZipCode).toEqual("07001");
    });
  });

  describe("US zipCode validation", () => {
    it("displays error message when less than 5 characters are entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "2222");
      expect(
        screen.getByText(Config.businessFormationDefaults.addressZipCodeUsDakotaErrorText)
      ).toBeInTheDocument();
    });

    it("displays error message when non-numeric zipCode is entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "AAAAA");
      expect(
        screen.getByText(Config.businessFormationDefaults.addressZipCodeUsDakotaErrorText)
      ).toBeInTheDocument();
    });

    it("passes zipCode validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "01752");
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.addressZipCode).toEqual("01752");
    });

    it("limits zipCode to 5-digits in length", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "US" }
      );
      page.fillText("Address zip code", "01752345");
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.addressZipCode).toEqual("01752");
    });
  });

  describe("INTL postal code validation", () => {
    it("displays error message when less than 5 characters are entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "2222");
      expect(
        screen.getByText(Config.businessFormationDefaults.addressZipCodeIntlDakotaErrorText)
      ).toBeInTheDocument();
    });

    it("displays error message when non-numeric postal code is entered", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "AAAAA");
      expect(
        screen.getByText(Config.businessFormationDefaults.addressZipCodeIntlDakotaErrorText)
      ).toBeInTheDocument();
    });

    it("passes 11-digit postal code validation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "12345678912");
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.addressZipCode).toEqual("12345678912");
    });

    it("limits postal code vto  11-digit digits in length", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressZipCode: "", businessLocationType: "INTL" }
      );
      page.fillText("Address zip code", "12345678912345");
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.addressZipCode).toEqual("12345678912");
    });
  });

  describe("Foreign date of formation", () => {
    const fieldLabel = "Foreign date of formation";

    it("shows error when there is an invalid date", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { foreignDateOfFormation: undefined });
      page.fillText(fieldLabel, "12/23");
      expect(
        screen.getByText(Config.businessFormationDefaults.foreignDateOfFormationErrorText)
      ).toBeInTheDocument();
    });

    it("saves an inputted date", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { foreignDateOfFormation: undefined });
      page.selectDate(getCurrentDate(), fieldLabel);
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.foreignDateOfFormation).toEqual(
        getCurrentDateFormatted(defaultDateFormat)
      );
    });
  });

  describe("business start date", () => {
    const fieldLabel = "Business start date";

    it("defaults date picker to current date when it has no value", async () => {
      const page = await getPageHelper({}, { businessStartDate: "" });
      expect(screen.getByLabelText("Business start date")).toBeInTheDocument();
      await page.submitBusinessStep();
      expect(currentUserData().formationData.formationFormData.businessStartDate).toEqual(
        getCurrentDateFormatted(defaultDateFormat)
      );
    });

    it("resets date on initial load", async () => {
      const yesterday = getCurrentDate().subtract(1, "day").format(defaultDateFormat);
      await getPageHelper({}, { businessStartDate: yesterday });
      expect(screen.getByLabelText("Business start date")).toHaveValue(
        getCurrentDateFormatted(defaultDisplayDateFormat)
      );
    });

    describe("businessStartDate validation", () => {
      describe("90 day limit", () => {
        const legalStructureIds = ["c-corporation", "s-corporation"];
        legalStructureIds.map((legalStructureId) =>
          describe(`${legalStructureId}`, () => {
            it("shows validation error past date limit", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().add(91, "day"), fieldLabel);
              expect(
                screen.getByText(Config.businessFormationDefaults.start90DateErrorText)
              ).toBeInTheDocument();
            });

            it("shows validation error for previous date", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
              expect(
                screen.getByText(Config.businessFormationDefaults.start90DateErrorText)
              ).toBeInTheDocument();
            });

            it("does not show validation error", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().add(89, "day"), fieldLabel);
              expect(
                screen.queryByText(Config.businessFormationDefaults.start90DateErrorText)
              ).not.toBeInTheDocument();
            });
          })
        );
      });

      describe("30 day limit for limited-partnership", () => {
        it("shows validation error past date limit", async () => {
          const page = await getPageHelper({ legalStructureId: "limited-partnership" }, {});
          page.selectDate(getCurrentDate().add(31, "day"), fieldLabel);
          expect(screen.getByText(Config.businessFormationDefaults.start30DateErrorText)).toBeInTheDocument();
        });

        it("shows validation error for previous date", async () => {
          const page = await getPageHelper({ legalStructureId: "limited-partnership" }, {});
          page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
          expect(screen.getByText(Config.businessFormationDefaults.start30DateErrorText)).toBeInTheDocument();
        });

        it("does not show validation error", async () => {
          const page = await getPageHelper({ legalStructureId: "limited-partnership" }, {});
          page.selectDate(getCurrentDate().add(29, "day"), fieldLabel);
          expect(
            screen.queryByText(Config.businessFormationDefaults.start30DateErrorText)
          ).not.toBeInTheDocument();
        });
      });

      describe("future date", () => {
        const legalStructureIds = ["limited-liability-company", "limited-liability-partnership"];
        legalStructureIds.map((legalStructureId) =>
          describe(`${legalStructureId}`, () => {
            it("shows validation error", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().subtract(4, "day"), fieldLabel);
              expect(
                screen.getByText(Config.businessFormationDefaults.startFutureDateErrorText)
              ).toBeInTheDocument();
            });

            it("does not show validation error", async () => {
              const page = await getPageHelper({ legalStructureId }, {});
              page.selectDate(getCurrentDate().add(120, "day"), fieldLabel);
              expect(
                screen.queryByText(Config.businessFormationDefaults.startFutureDateErrorText)
              ).not.toBeInTheDocument();
            });
          })
        );
      });

      describe("current date", () => {
        const legalStructureIds = ["limited-liability-company"];
        const businessPersona = "FOREIGN";
        legalStructureIds.map((legalStructureId) =>
          describe(`${legalStructureId}`, () => {
            it("shows field as disabled", async () => {
              await getPageHelper({ legalStructureId, businessPersona }, {});
              expect(screen.getByLabelText("Business start date")).toBeDisabled();
            });

            it("reset to current date", async () => {
              await getPageHelper(
                { legalStructureId, businessPersona },
                { businessStartDate: getCurrentDate().subtract(4, "day").format(defaultDisplayDateFormat) }
              );
              expect(screen.getByLabelText("Business start date")).toHaveValue(
                getCurrentDate().format(defaultDisplayDateFormat)
              );
            });
          })
        );
      });
    });
  });

  describe("profile data information", () => {
    it("displays llc legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "limited-liability-company" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.llcText);
    });

    it("displays llp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "limited-liability-partnership" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.llpText);
    });

    it("displays lp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "limited-partnership" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.lpText);
    });

    it("displays sCorp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "s-corporation" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.sCorpText);
    });

    it("displays cCorp legal structure from profile data", async () => {
      await getPageHelper({ legalStructureId: "c-corporation" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      expect(displayLegalStructure).toHaveTextContent(Config.businessFormationDefaults.cCorpText);
    });

    it("displays foreign label ahead of legal structure from profile data", async () => {
      const legalStructureId = randomPublicFilingLegalType();
      await getPageHelper({ legalStructureId, businessPersona: "FOREIGN" }, {});
      const displayLegalStructure = screen.getByTestId("legal-structure");
      const names = {
        "limited-liability-company": Config.businessFormationDefaults.llcText,
        "limited-liability-partnership": Config.businessFormationDefaults.llpText,
        "limited-partnership": Config.businessFormationDefaults.lpText,
        "c-corporation": Config.businessFormationDefaults.cCorpText,
        "s-corporation": Config.businessFormationDefaults.sCorpText,
      };
      expect(displayLegalStructure).toHaveTextContent(
        `${Config.businessFormationDefaults.foreignLegalPrefaceText} ${names[legalStructureId]}`
      );
    });

    it("displays business name from name check step and overrides profile", async () => {
      const page = await getPageHelper({ businessName: "some cool name" }, {});

      fireEvent.click(screen.getByText(Config.businessFormationDefaults.previousButtonText));
      await page.fillAndSubmitBusinessNameStep("another cool name");

      expect(screen.getByText("another cool name", { exact: false })).toBeInTheDocument();
      expect(screen.queryByText("some cool name", { exact: false })).not.toBeInTheDocument();

      expect(
        screen.queryByText(Config.businessFormationDefaults.notSetBusinessNameText, { exact: false })
      ).not.toBeInTheDocument();
    });

    it("displays City (Main Address) from profile data", async () => {
      await getPageHelper(
        { municipality: generateMunicipality({ displayName: "Newark", name: "Newark" }) },
        {}
      );
      expect((screen.getByLabelText("Address municipality") as HTMLInputElement).value).toEqual("Newark");

      expect(
        screen.queryByText(Config.businessFormationDefaults.addressCityPlaceholder, {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });

  describe("required fields", () => {
    const attemptApiSubmission = async (page: FormationPageHelpers) => {
      await page.stepperClickToReviewStep();
      await page.clickSubmit();
      await page.stepperClickToBusinessStep();
    };

    it("Business suffix", async () => {
      const page = await getPageHelper({}, { businessSuffix: undefined });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessSuffix
      );
    });

    it("Withdrawals", async () => {
      const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { withdrawals: "" });
      await attemptApiSubmission(page);
      expect(screen.getByText(Config.businessFormationDefaults.genericErrorText)).toBeInTheDocument();
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.withdrawals
      );
    });

    it("Dissolution", async () => {
      const page = await getPageHelper({ legalStructureId: "limited-partnership" }, { dissolution: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.dissolution
      );
    });

    it("Combined Investment", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { combinedInvestment: "" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.combinedInvestment
      );
    });

    it("Partnership Rights can create Limited Partner", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canCreateLimitedPartner: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getByText(Config.businessFormationDefaults.genericErrorText)).toBeInTheDocument();
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.canCreateLimitedPartner
      );
    });

    it("Partnership Rights Limited Partner Terms", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canCreateLimitedPartner: undefined, createLimitedPartnerTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canCreateLimitedPartner-true"));
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.createLimitedPartnerTerms
      );
    });

    it("Partnership Rights can make distribution", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canMakeDistribution: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.canMakeDistribution
      );
    });

    it("Partnership Rights make distribution terms", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canMakeDistribution: undefined, makeDistributionTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canMakeDistribution-true"));
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.makeDistributionTerms
      );
    });

    it("Partnership Rights can get distribution", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canGetDistribution: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getAllByRole("alert")[0]).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.canGetDistribution
      );
    });

    it("Partnership Rights get distribution terms", async () => {
      const page = await getPageHelper(
        { legalStructureId: "limited-partnership" },
        { canGetDistribution: undefined, getDistributionTerms: "" }
      );
      fireEvent.click(screen.getByTestId("canGetDistribution-true"));
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.getDistributionTerms
      );
    });

    it("Total Shares", async () => {
      const page = await getPageHelper({ legalStructureId: "c-corporation" }, { businessTotalStock: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.businessTotalStock
      );
      expect(
        screen.getByText(Config.businessFormationDefaults.businessTotalStockErrorText)
      ).toBeInTheDocument();
    });

    it("Foreign date of formation", async () => {
      const page = await getPageHelper({ businessPersona: "FOREIGN" }, { foreignDateOfFormation: undefined });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.foreignDateOfFormation
      );
    });

    it("Foreign state of formation", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { foreignStateOfFormation: undefined }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.foreignStateOfFormation
      );
    });

    it("Address line1", async () => {
      const page = await getPageHelper({}, { addressLine1: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressLine1
      );
    });

    it("Address zip code", async () => {
      const page = await getPageHelper({}, { addressZipCode: "" });
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressZipCode
      );
    });

    it("Address province", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressProvince: undefined, businessLocationType: "INTL" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressProvince
      );
    });

    it("Address country", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCountry: undefined, businessLocationType: "INTL" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressCountry
      );
    });

    it("Address city", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressCity: undefined, businessLocationType: "INTL" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressCity
      );
    });

    it("Address state", async () => {
      const page = await getPageHelper(
        { businessPersona: "FOREIGN" },
        { addressState: undefined, businessLocationType: "US" }
      );
      await attemptApiSubmission(page);
      expect(screen.getByRole("alert")).toHaveTextContent(
        Config.businessFormationDefaults.requiredFieldsBulletPointLabel.addressState
      );
    });
  });
});
