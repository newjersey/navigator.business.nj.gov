import * as api from "@/lib/api-client/apiClient";
import { generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import {
  fillText,
  getSearchValue,
  searchAndFail,
  searchAndGetValue,
  searchAndReject,
  searchButton,
} from "@/test/helpers/helpersSearchBusinessName";
import {
  castPublicFilingLegalTypeToFormationType,
  generateBusiness,
  generateFormationFormData,
  ProfileData,
  PublicFilingLegalType,
} from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { fireEvent, screen, within } from "@testing-library/react";

function mockMaterialUI(): typeof materialUi {
  return {
    ...vi.requireActual("@mui/material"),
    useMediaQuery: vi.fn(),
  };
}

vi.mock("@mui/material", () => mockMaterialUI());
vi.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: vi.fn() }));
vi.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: vi.fn() }));
vi.mock("@/lib/data-hooks/useDocuments");
vi.mock("next/compat/router", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/api-client/apiClient", () => ({
  postBusinessFormation: vi.fn(),
  getCompletedFiling: vi.fn(),
  searchBusinessName: vi.fn(),
}));

const mockApi = api as vi.Mocked<typeof api>;

describe("SearchBusinessNameForm", () => {
  const displayContent = {
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (initialProfileData?: Partial<ProfileData>): Promise<FormationPageHelpers> => {
    const profileData = generateFormationProfileData({
      ...initialProfileData,
      legalStructureId: "limited-liability-company",
      businessPersona: "FOREIGN",
    });
    const formationData = {
      formationFormData: generateFormationFormData(
        {},
        {
          legalStructureId: castPublicFilingLegalTypeToFormationType(
            profileData.legalStructureId as PublicFilingLegalType,
            profileData.businessPersona
          ),
        }
      ),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    };
    return preparePage({ business: generateBusiness({ profileData, formationData }), displayContent });
  };

  it("displays modal when legal structure Edit button clicked", async () => {
    const page = await getPageHelper();
    await page.searchBusinessName({ status: "AVAILABLE" });

    expect(true).toBe(true);
  });

  it("pre-fills the text field with the business name entered in profile", async () => {
    await getPageHelper({
      businessName: "Best Pizza",
    });
    expect(getSearchValue()).toEqual("Best Pizza");
  });

  it("types a new potential name", async () => {
    await getPageHelper({
      businessName: "Best Pizza",
    });
    fillText("My other new name");
    expect(getSearchValue()).toEqual("My other new name");
  });

  it("checks availability of typed name", async () => {
    await getPageHelper();
    fillText("Pizza Joint");
    await searchAndGetValue({});
    expect(mockApi.searchBusinessName).toHaveBeenCalledWith("Pizza Joint");
  });

  it("shows available component if name is available", async () => {
    await getPageHelper();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(availableTextExists()).toBe(true);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("removes availabile component when new values are typed into the field", async () => {
    await getPageHelper();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "AVAILABLE" });
    expect(availableTextExists()).toBe(true);
    expect(unavailableTextExists()).toBe(false);
    fillText("Pizza Place");
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
  });

  it("shows unavailable component if name is not available", async () => {
    await getPageHelper();
    fillText("Pizza Joint");
    await searchAndGetValue({ status: "UNAVAILABLE" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(true);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("shows designator error text if name includes the designator", async () => {
    await getPageHelper();
    fillText("Pizza Joint LLC");
    await searchAndGetValue({ status: "DESIGNATOR_ERROR" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(true);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("shows special character error text if name includes a special character", async () => {
    await getPageHelper();
    fillText("Pizza Joint LLC");
    await searchAndGetValue({ status: "SPECIAL_CHARACTER_ERROR" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(true);
    expect(restrictedWordErrorTextExists()).toBe(false);
  });

  it("shows restricted word error text if name includes a restricted word", async () => {
    await getPageHelper();
    fillText("Pizza Joint LLC");
    await searchAndGetValue({ status: "RESTRICTED_ERROR", invalidWord: "JOINT" });
    expect(availableTextExists()).toBe(false);
    expect(unavailableTextExists()).toBe(false);
    expect(designatorErrorTextExists()).toBe(false);
    expect(specialCharacterErrorTextExists()).toBe(false);
    expect(restrictedWordErrorTextExists()).toBe(true);
    expect(
      within(screen.getByTestId("restricted-word-error-text")).getByText("JOINT", { exact: false })
    ).toBeInTheDocument();
  });

  it("does not search empty name", async () => {
    await getPageHelper();
    fillText("");
    fireEvent.click(searchButton());
    expect(mockApi.searchBusinessName).not.toHaveBeenCalled();
  });

  it("shows message if search returns 400", async () => {
    await getPageHelper();
    fillText("LLC");
    await searchAndReject();
    expect(screen.getByTestId("error-alert-BAD_INPUT")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-BAD_INPUT")).not.toBeInTheDocument();
  });

  it("shows error if search fails", async () => {
    await getPageHelper();
    fillText("whatever");
    await searchAndFail();
    expect(screen.getByTestId("error-alert-SEARCH_FAILED")).toBeInTheDocument();
    fillText("anything");
    await searchAndGetValue({ status: "AVAILABLE", similarNames: [] });
    expect(screen.queryByTestId("error-alert-SEARCH_FAILED")).not.toBeInTheDocument();
  });

  const availableTextExists = (): boolean => {
    return screen.queryByTestId("available-text") !== null;
  };
  const unavailableTextExists = (): boolean => {
    return screen.queryAllByTestId("unavailable-text").length > 0;
  };
  const designatorErrorTextExists = (): boolean => {
    return screen.queryByTestId("designator-error-text") !== null;
  };
  const specialCharacterErrorTextExists = (): boolean => {
    return screen.queryByTestId("special-character-error-text") !== null;
  };
  const restrictedWordErrorTextExists = (): boolean => {
    return screen.queryByTestId("restricted-word-error-text") !== null;
  };
});
