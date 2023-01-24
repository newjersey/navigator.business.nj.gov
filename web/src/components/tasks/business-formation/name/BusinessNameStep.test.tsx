import {
  generateFormationDbaContent,
  generateFormationDisplayContentMap,
  generateUserData,
} from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { createEmptyFormationFormData } from "@businessnjgovnavigator/shared";
import * as materialUi from "@mui/material";
import { screen } from "@testing-library/react";

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

describe("Formation - BusinessNameStep", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = (initialBusinessName?: string): FormationPageHelpers => {
    const profileData = initialBusinessName
      ? generateFormationProfileData({ businessName: initialBusinessName })
      : generateFormationProfileData({});
    const formationData = {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
    };
    return preparePage(generateUserData({ profileData, formationData }), {
      formationDisplayContentMap: generateFormationDisplayContentMap({}),
      formationDbaContent: generateFormationDbaContent({}),
    });
  };

  it("pre-fills the text field with the business name from profile", () => {
    getPageHelper("My Restaurant");
    expect((screen.getByLabelText("Search business name") as HTMLInputElement).value).toEqual(
      "My Restaurant"
    );
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
});
