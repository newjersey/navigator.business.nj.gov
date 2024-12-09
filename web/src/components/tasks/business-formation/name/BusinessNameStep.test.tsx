import { getMergedConfig } from "@/contexts/configContext";
import { generateEmptyFormationData, generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import {
  createEmptyFormationFormData,
  foreignLegalTypePrefix,
  FormationLegalType,
  generateBusiness,
  generateBusinessNameAvailability,
  generateFormationFormData,
  NameAvailability,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...jest.requireActual("@mui/material"),
    useMediaQuery: jest.fn(),
  };
}

const Config = getMergedConfig();

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

describe("Formation - BusinessNameStep", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = (
    initialBusinessName?: string,
    businessNameAvailability?: NameAvailability
  ): FormationPageHelpers => {
    const profileData = initialBusinessName
      ? generateFormationProfileData({ businessName: initialBusinessName })
      : generateFormationProfileData({});
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: businessNameAvailability ?? undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };
    return preparePage({
      business: generateBusiness({ profileData, formationData }),
      displayContent: { formationDbaContent: generateFormationDbaContent({}) },
    });
  };

  it("pre-fills the text field with the business name from profile", () => {
    getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );
  });

  it("pre-fills the error state with the error from formation data", () => {
    getPageHelper(
      "My Restaurant",
      generateBusinessNameAvailability({
        status: "UNAVAILABLE",
      })
    );
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
  });

  it("overrides the text field's initial value if user types in field", () => {
    const page = getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );

    page.fillText("Search business name", "My New Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My New Restaurant"
    );
  });

  it("displays the confirm availability inline error when user blurs without searching", () => {
    const page = getPageHelper();
    page.fillText("Search business name", "First Name");
    page.fillAndBlurBusinessName();
    expect(
      screen.getByText(Config.formation.fields.businessName.errorInlineNeedsToSearch)
    ).toBeInTheDocument();
  });

  it("displays the confirm availability inline error when user types in a new name after finding an available one", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "First Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
    await page.fillAndBlurBusinessName("New Name");
    expect(
      screen.getByText(Config.formation.fields.businessName.errorInlineNeedsToSearch)
    ).toBeInTheDocument();
  });

  it("does not display available alert if user types in new name after finding an available one", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "First Name");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();

    page.fillText("Search business name", "Second Name");
    expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows available text if name is available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(screen.getByTestId("available-text")).toBeInTheDocument();
    expect(screen.queryByTestId("unavailable-text")).not.toBeInTheDocument();
  });

  it("shows unavailable text if name is not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(screen.getByTestId("unavailable-text")).toBeInTheDocument();
    expect(screen.queryByTestId("available-text")).not.toBeInTheDocument();
  });

  it("shows DESIGNATOR error text if name is not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
    expect(screen.getByTestId("designator-error-text")).toBeInTheDocument();
  });

  it("shows SPECIAL_CHARACTER error text if name is not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "SPECIAL_CHARACTER_ERROR" });
    expect(screen.getByTestId("special-character-error-text")).toBeInTheDocument();
  });

  it("shows RESTRICTED error text if name is not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "RESTRICTED_ERROR", invalidWord: "Joint" });
    expect(screen.getByTestId("restricted-word-error-text")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("restricted-word-error-text")).getByText("Joint", { exact: false })
    ).toBeInTheDocument();
  });

  it("shows similar unavailable names when not available", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Pizza Joint");
    await page.searchBusinessName({ status: "UNAVAILABLE", similarNames: ["Rusty's Pizza", "Pizzapizza"] });
    expect(screen.getByText("Rusty's Pizza")).toBeInTheDocument();
    expect(screen.getByText("Pizzapizza")).toBeInTheDocument();
  });

  it("shows message if search returns 400", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "LLC");
    await page.searchBusinessNameAndGetError(400);
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();

    page.fillText("Search business name", "LLCA");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails with 500", async () => {
    const page = getPageHelper();

    page.fillText("Search business name", "Anything");
    await page.searchBusinessNameAndGetError(500);
    expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    page.fillText("Search business name", "Anything else");
    await page.searchBusinessName({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  describe("after validation - when business name field is focused", () => {
    it("shows error when business name changes", async () => {
      const page = getPageHelper();
      page.fillText("Search business name", "Apple Pies Rocks");

      await page.searchBusinessName({ status: "AVAILABLE" });
      expect(screen.getByTestId("available-text")).toBeInTheDocument();

      const businessNameField = screen.getByLabelText("Search business name");
      fireEvent.change(businessNameField, { target: { value: "Apple Pies Rockettes" } });

      expect(
        screen.getByText(Config.formation.fields.businessName.errorInlineNeedsToSearch)
      ).toBeInTheDocument();
    });

    it("shows error when business name is deleted", async () => {
      const page = getPageHelper();
      page.fillText("Search business name", "Apple Pies Rocks");

      await page.searchBusinessName({ status: "AVAILABLE" });
      expect(screen.getByTestId("available-text")).toBeInTheDocument();

      const businessNameField = screen.getByLabelText("Search business name");
      fireEvent.change(businessNameField, { target: { value: "" } });

      expect(screen.getByText(Config.formation.fields.businessName.errorInlineEmpty)).toBeInTheDocument();
    });
  });

  describe("content", () => {
    const domesticTypes: FormationLegalType[] = [
      "limited-liability-company",
      "limited-liability-partnership",
      "limited-partnership",
      "c-corporation",
      "s-corporation",
    ];
    const foreignTypes: FormationLegalType[] = [
      "foreign-limited-liability-company",
      "foreign-limited-liability-partnership",
    ];

    for (const legalStructureId of domesticTypes) {
      it(`uses default content for ${legalStructureId}`, () => {
        const profileData = generateFormationProfileData({ legalStructureId, businessPersona: "STARTING" });
        const formationData = {
          formationFormData: generateFormationFormData({}, { legalStructureId }),
          formationResponse: undefined,
          getFilingResponse: undefined,
          completedFilingPayment: false,
          businessNameAvailability: undefined,
          dbaBusinessNameAvailability: undefined,
          lastVisitedPageIndex: 0,
        };

        preparePage({
          business: generateBusiness({ profileData, formationData }),
          displayContent: { formationDbaContent: generateFormationDbaContent({}) },
        });

        expect(screen.getByText(Config.formation.fields.businessName.header)).toBeInTheDocument();
        expect(
          screen.queryByText(Config.formation.fields.businessName.overrides.foreign.header)
        ).not.toBeInTheDocument();
      });
    }

    for (const legalStructureId of foreignTypes) {
      it(`uses override content for ${legalStructureId}`, () => {
        const legalStructureWithoutPrefix = legalStructureId.replace(foreignLegalTypePrefix, "");
        const profileData = generateFormationProfileData({
          legalStructureId: legalStructureWithoutPrefix,
          businessPersona: "FOREIGN",
          businessName: "some name",
        });

        preparePage({
          business: generateBusiness({ profileData, formationData: generateEmptyFormationData() }),
          displayContent: { formationDbaContent: generateFormationDbaContent({}) },
        });

        expect(
          screen.getByText(Config.formation.fields.businessName.overrides.foreign.header)
        ).toBeInTheDocument();
        expect(screen.queryByText(Config.formation.fields.businessName.header)).not.toBeInTheDocument();
      });
    }
  });
});
