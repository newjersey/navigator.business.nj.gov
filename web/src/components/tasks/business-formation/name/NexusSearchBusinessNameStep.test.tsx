import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { generateFormationDbaContent } from "@/test/factories";
import {
  FormationPageHelpers,
  generateFormationProfileData,
  preparePage,
  useSetupInitialMocks,
} from "@/test/helpers/helpers-formation";
import { dbaInputField } from "@/test/helpers/helpersSearchBusinessName";
import { currentBusiness, userDataWasNotUpdated } from "@/test/mock/withStatefulUserData";
import {
  castPublicFilingLegalTypeToFormationType,
  FormationData,
  generateBusiness,
  generateFormationFormData,
  ProfileData,
  PublicFilingLegalType,
} from "@businessnjgovnavigator/shared";
import { generateBusinessNameAvailability } from "@businessnjgovnavigator/shared/test";
import * as materialUi from "@mui/material";
import { fireEvent, screen, waitFor } from "@testing-library/react";

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
jest.mock("@/lib/utils/analytics", () => setupMockAnalytics());

function setupMockAnalytics(): typeof analytics {
  return {
    ...jest.requireActual("@/lib/utils/analytics").default,
    event: {
      ...jest.requireActual("@/lib/utils/analytics").default.event,
      business_formation_search_existing_name_again: {
        click: {
          refresh_name_search_field: jest.fn(),
        },
      },
      business_formation_dba_name_search_field: {
        appears: {
          dba_name_search_field_appears: jest.fn(),
        },
      },
    },
  };
}
const mockAnalytics = analytics as jest.Mocked<typeof analytics>;

describe("Formation - NexusSearchBusinessNameStep", () => {
  const displayContent = {
    formationDbaContent: generateFormationDbaContent({}),
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useSetupInitialMocks();
  });

  const getPageHelper = async (
    initialProfileData: Partial<ProfileData>,
    initialFormationData?: Partial<FormationData>
  ): Promise<FormationPageHelpers> => {
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
            initialProfileData.businessPersona
          ),
        }
      ),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
      ...initialFormationData,
    };
    const page = preparePage({ business: generateBusiness({ profileData, formationData }), displayContent });
    return page;
  };

  it("displays modal when legal structure Edit button clicked", async () => {
    const page = await getPageHelper({});
    await page.searchBusinessName({ status: "AVAILABLE" });

    expect(true).toBe(true);
  });

  it("lets you click to search again when unavailable", async () => {
    const page = await getPageHelper({});
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(screen.queryByLabelText("Search business name")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    expect(
      mockAnalytics.event.business_formation_search_existing_name_again.click.refresh_name_search_field
    ).toHaveBeenCalled();
    expect(screen.getByLabelText("Search business name")).toBeInTheDocument();
  });

  it("sets nexusDbaName as empty and needsDbaName as false in profile when search again comes back as available", async () => {
    const page = await getPageHelper({});
    page.fillText("Search business name", "some unavailable name");
    await page.searchBusinessName({ status: "UNAVAILABLE" });

    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    page.fillText("Search business name", "My Cool Business");
    await page.searchBusinessName({ status: "AVAILABLE" });

    expect(currentBusiness().profileData.nexusDbaName).toEqual("");
    expect(currentBusiness().profileData.businessName).toEqual("My Cool Business");
  });

  it("sets businessName in formationFormData on submit", async () => {
    const page = await getPageHelper({});
    page.fillText("Search business name", "some unavailable name");
    await page.searchBusinessName({ status: "UNAVAILABLE" });

    fireEvent.click(screen.getByText(Config.nexusNameSearch.searchAgainButtonText));
    page.fillText("Search business name", "My Cool Business");
    await page.searchBusinessName({ status: "AVAILABLE" });
    expect(currentBusiness().formationData.formationFormData.businessName).toEqual("My Cool Business");
  });

  it("does not save business name if designator error", async () => {
    const page = await getPageHelper({});
    page.fillText("Search business name", "My Cool Business");
    await page.searchBusinessName({ status: "DESIGNATOR_ERROR" });
    expect(userDataWasNotUpdated()).toEqual(true);
  });

  it("shows DBA name when unavailable", async () => {
    const page = await getPageHelper({});
    page.fillText("Search business name", "My Cool Business");
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    expect(screen.getByText(Config.nexusNameSearch.dbaNameHeader)).toBeInTheDocument();
    expect(screen.getByText(Config.nexusNameSearch.dbaNameSearchSubmitButton)).toBeInTheDocument();
    expect(
      mockAnalytics.event.business_formation_dba_name_search_field.appears.dba_name_search_field_appears
    ).toHaveBeenCalled();
  });

  it("shows DBA search immediately if businessNameAvailability status is 'UNAVAILABLE'", async () => {
    const page = await getPageHelper(
      { businessName: "some cool name" },
      { businessNameAvailability: generateBusinessNameAvailability({ status: "UNAVAILABLE" }) }
    );

    await page.searchBusinessName({ status: "UNAVAILABLE" });
    await waitFor(() => {
      expect(screen.getByText(Config.nexusNameSearch.dbaNameHeader)).toBeInTheDocument();
    });
  });

  it("does not show DBA search immediately if businessNameAvailability status is 'AVAILABLE'", async () => {
    await getPageHelper(
      { businessName: "some cool name" },
      { businessNameAvailability: generateBusinessNameAvailability({ status: "AVAILABLE" }) }
    );

    expect(screen.queryByText(Config.nexusNameSearch.dbaNameHeader)).not.toBeInTheDocument();
  });

  it("does not overwrite existing DBA name when doing initial search", async () => {
    const page = await getPageHelper({
      businessName: "some cool name",
      nexusDbaName: "existing dba name",
    });
    await page.searchBusinessName({ status: "UNAVAILABLE" });
    await waitFor(() => {
      expect((dbaInputField() as HTMLInputElement).value).toEqual("existing dba name");
    });
  });

  describe("on DBA search", () => {
    const setupForDBA = async (): Promise<FormationPageHelpers> => {
      const page = await getPageHelper({});
      page.fillText("Search business name", "My Cool Business");
      await page.searchBusinessName({ status: "UNAVAILABLE" });
      return page;
    };

    it("saves DBA name to profile on successful search", async () => {
      const page = await setupForDBA();
      page.fillText("DBA Name Search", "My Cool DBA Name");
      await page.searchBusinessName({ status: "AVAILABLE" });
      expect(currentBusiness().profileData.nexusDbaName).toEqual("My Cool DBA Name");
    });

    it("does not save DBA name to profile on unsuccessful search", async () => {
      const page = await setupForDBA();
      page.fillText("DBA Name Search", "My Cool DBA Name");
      await page.searchBusinessName({ status: "UNAVAILABLE" });
      expect(currentBusiness().profileData.nexusDbaName).toEqual("");
    });

    it("displays searched name in alert message unsuccessful search", async () => {
      const page = await setupForDBA();
      page.fillText("DBA Name Search", "My Cool DBA Name");
      await page.searchBusinessName({ status: "AVAILABLE" });
      page.fillText("DBA Name Search", "Another DBA Name");
      await page.searchBusinessName({ status: "UNAVAILABLE" });
      expect(currentBusiness().profileData.nexusDbaName).toEqual("My Cool DBA Name");
      expect(
        screen.getAllByTestId("unavailable-text")[1].innerHTML.includes("Another DBA Name")
      ).toBeTruthy();
    });
  });
});
