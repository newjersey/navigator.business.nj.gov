import { SidebarCardFundingNudge } from "@/components/dashboard/SidebarCardFundingNudge";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { SidebarCardContent } from "@/lib/types/types";
import {
  generateEmptyFormationData,
  generateSidebarCardContent,
  randomPublicFilingLegalType,
} from "@/test/factories";
import { selectDropdownByValue } from "@/test/helpers/helpers-testing-library-selectors";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import { useMockRouter } from "@/test/mock/mockRouter";
import {
  currentBusiness,
  setupStatefulUserDataContext,
  userDataWasNotUpdated,
  WithStatefulUserData,
} from "@/test/mock/withStatefulUserData";
import {
  FormationData,
  FormationLegalType,
  getCurrentBusiness,
  getCurrentDateISOString,
  OperatingPhaseId,
  OperatingPhases,
  UserData,
} from "@businessnjgovnavigator/shared";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import {
  generateBusiness,
  generateFormationData,
  generateGetFilingResponse,
  generatePreferences,
  generateProfileData,
  generateTaxFilingData,
  generateUserDataForBusiness,
  randomIndustry,
  randomLegalStructure,
} from "@businessnjgovnavigator/shared/test";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));
jest.mock("@/lib/data-hooks/useRoadmap", () => ({ useRoadmap: jest.fn() }));
jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxFilingsOnboarding: jest.fn(),
}));
const mockApi = api as jest.Mocked<typeof api>;

jest.mock("next/router", () => ({ useRouter: jest.fn() }));

const Config = getMergedConfig();

const mockApiResponse = (userData: UserData, overrides: Partial<Business>): void => {
  mockApi.postTaxFilingsOnboarding.mockResolvedValue({
    ...userData,
    businesses: {
      ...userData.businesses,
      [userData.currentBusinessId]: {
        ...userData.businesses[userData.currentBusinessId],
        ...overrides,
      },
    },
  });
};

describe("<SidebarCardFundingNudge />", () => {
  let card: SidebarCardContent;
  const { fundingNudge } = SIDEBAR_CARDS;

  const renderWithBusiness = (business: Partial<Business>): void => {
    render(
      <WithStatefulUserData initialUserData={generateUserDataForBusiness(generateBusiness(business))}>
        <SidebarCardFundingNudge card={card} />
      </WithStatefulUserData>
    );
  };

  beforeEach(() => {
    jest.resetAllMocks();
    useMockRouter({});
    setupStatefulUserDataContext();
    card = generateSidebarCardContent({ id: fundingNudge });
  });

  const generateTaxFilingUserData = (params: {
    publicFiling: boolean;
    formedInNavigator?: boolean;
    businessName?: string;
    responsibleOwnerName?: string;
    taxId?: string;
    industryId?: string;
  }): UserData => {
    let formationData: FormationData = generateEmptyFormationData();

    const legalStructureId = params.publicFiling
      ? randomPublicFilingLegalType()
      : randomLegalStructure({ requiresPublicFiling: false }).id;
    if (params.publicFiling) {
      formationData = generateFormationData(
        {
          completedFilingPayment: !!params.formedInNavigator,
          getFilingResponse: generateGetFilingResponse({ success: params.formedInNavigator }),
        },
        legalStructureId as FormationLegalType
      );
    }

    return generateUserDataForBusiness(
      generateBusiness({
        profileData: generateProfileData({
          legalStructureId: legalStructureId,
          operatingPhase: randomElementFromArray(
            OperatingPhases.filter((obj) => {
              return obj.displayTaxAccessButton;
            })
          ).id,
          taxId: params.taxId ? `*${params.taxId.slice(1)}` : "",
          encryptedTaxId: params.taxId ? `encrypted-${params.taxId}` : "",
          businessName: params.businessName || "",
          responsibleOwnerName: params.responsibleOwnerName || "",
          industryId: params.industryId || "generic",
        }),
        formationData: formationData,
        taxFilingData: generateTaxFilingData({ state: undefined }),
      })
    );
  };

  const userDataWithPrefilledFields = generateTaxFilingUserData({
    publicFiling: true,
    taxId: "123456789098",
    businessName: "MrFakesHotDogBonanza",
    industryId: randomIndustry().id,
  });

  const userDataWithGenericIndustry = generateTaxFilingUserData({
    publicFiling: true,
    taxId: "123456789123",
    businessName: "MrFakesHotDog",
    industryId: "generic",
  });

  const userDataMissingTaxId = generateTaxFilingUserData({
    publicFiling: true,
    taxId: "",
    businessName: "MrFakesHotDogBonanza",
    industryId: randomIndustry().id,
  });

  const userDataMissingBusinessName = generateTaxFilingUserData({
    publicFiling: true,
    taxId: "123456789123",
    businessName: "",
    industryId: randomIndustry().id,
  });

  describe("when clicking funding button for non-generic industry", () => {
    it("updates operating phase to UP_AND_RUNNING and marks tax registration task complete", async () => {
      const business = getCurrentBusiness(userDataWithPrefilledFields);
      mockApiResponse(userDataWithPrefilledFields, {
        taxFilingData: generateTaxFilingData({
          state: "SUCCESS",
          registeredISO: getCurrentDateISOString(),
        }),
      });

      renderWithBusiness({
        profileData: generateProfileData({
          ...business.profileData,
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));
      await waitFor(() => {
        expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.UP_AND_RUNNING);
      });

      await waitFor(() => {
        expect(currentBusiness().taxFilingData.state).toEqual("SUCCESS");
      });
    });
  });

  describe("when clicking funding button for generic industry", () => {
    it("updates with new sector, marks tax registration task complete, and operating phase to UP_AND_RUNNING after modal success", async () => {
      const business = getCurrentBusiness(userDataWithGenericIndustry);

      renderWithBusiness({
        profileData: generateProfileData({
          ...business.profileData,
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));

      expect(screen.getByText(Config.dashboardDefaults.sectorModalTitle)).toBeInTheDocument();
      selectDropdownByValue("Sector", "clean-energy");
      fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalSaveButton));
      await waitFor(() => {
        expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.UP_AND_RUNNING);
      });

      expect(currentBusiness().profileData.sectorId).toEqual("clean-energy");
    });

    it("does not update operating phase when user cancels from within modal", () => {
      renderWithBusiness({
        profileData: generateProfileData({
          businessPersona: "STARTING",
          industryId: "generic",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));

      expect(screen.getByText(Config.dashboardDefaults.sectorModalTitle)).toBeInTheDocument();
      selectDropdownByValue("Sector", "clean-energy");
      fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalCancelButton));
      expect(userDataWasNotUpdated()).toEqual(true);
    });
  });

  describe("updates operating phase", () => {
    it("when missing taxId and fails tax registration", async () => {
      const business = getCurrentBusiness(userDataMissingTaxId);
      mockApiResponse(userDataMissingTaxId, {
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          registeredISO: getCurrentDateISOString(),
        }),
      });
      renderWithBusiness({
        profileData: generateProfileData({
          ...business.profileData,
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));
      await waitFor(() => {
        expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.UP_AND_RUNNING);
      });
    });

    it("when missing businessName and fails tax registration", async () => {
      const business = getCurrentBusiness(userDataMissingBusinessName);
      mockApiResponse(userDataMissingBusinessName, {
        taxFilingData: generateTaxFilingData({
          state: "FAILED",
          registeredISO: getCurrentDateISOString(),
        }),
      });
      renderWithBusiness({
        profileData: generateProfileData({
          ...business.profileData,
          businessPersona: "STARTING",
        }),
        preferences: generatePreferences({ visibleSidebarCards: [fundingNudge] }),
      });

      fireEvent.click(screen.getByTestId("cta-funding-nudge"));
      await waitFor(() => {
        expect(currentBusiness().profileData.operatingPhase).toEqual(OperatingPhaseId.UP_AND_RUNNING);
      });
    });
  });
});
