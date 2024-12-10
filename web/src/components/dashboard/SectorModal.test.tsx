import { SectorModal } from "@/components/dashboard/SectorModal";
import { getMergedConfig } from "@/contexts/configContext";
import * as api from "@/lib/api-client/apiClient";
import { useMockBusiness } from "@/test/mock/mockUseUserData";
import { createPageHelpers, PageHelpers } from "@/test/pages/onboarding/helpers-onboarding";
import {
  generateBusiness,
  generateProfileData,
  generateUserDataForBusiness,
} from "@businessnjgovnavigator/shared";
import { Business, UserData } from "@businessnjgovnavigator/shared/api/types";
import { generateTaxFilingData } from "@businessnjgovnavigator/shared/test";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const submitSectorModal = (): void => {
  fireEvent.click(screen.getByText(Config.dashboardDefaults.sectorModalSaveButton));
};
jest.mock("@/lib/api-client/apiClient", () => ({
  postTaxFilingsOnboarding: jest.fn(),
  postTaxFilingsLookup: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

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

const Config = getMergedConfig();

jest.mock("@/lib/data-hooks/useUserData", () => ({ useUserData: jest.fn() }));

describe("<SectorModal />", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    useMockBusiness({});
  });

  const renderSectorModal = (onContinue?: jest.Mock): { page: PageHelpers } => {
    render(
      <SectorModal open={true} handleClose={(): void => {}} onContinue={onContinue ?? ((): void => {})} />
    );
    const page = createPageHelpers();
    return { page };
  };

  it("shows sector for generic industry", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        industryId: "generic",
        businessPersona: "STARTING",
        sectorId: undefined,
      }),
    });

    useMockBusiness(business);
    renderSectorModal();

    expect((screen.getByLabelText("Sector") as HTMLInputElement)?.value).toEqual("");
  });

  it("fires validations when clicking submit", () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        businessPersona: "STARTING",
        legalStructureId: "limited-liability-partnership",
        dateOfFormation: undefined,
        sectorId: undefined,
        industryId: undefined,
        ownershipTypeIds: [],
        existingEmployees: undefined,
      }),
    });

    useMockBusiness(business);
    const onContinue = jest.fn();
    renderSectorModal(onContinue);
    submitSectorModal();
    expect(onContinue).not.toHaveBeenCalled();
    expect(
      screen.getByText(Config.profileDefaults.fields.sectorId.default.errorTextRequired)
    ).toBeInTheDocument();
  });

  it("calls onContinue prop on successful submit", async () => {
    const business = generateBusiness({
      profileData: generateProfileData({
        sectorId: undefined,
        industryId: "generic",
      }),
    });
    const userData = generateUserDataForBusiness(business);

    mockApiResponse(userData, {
      profileData: {
        ...business.profileData,
        municipality: undefined,
      },
      taxFilingData: generateTaxFilingData({
        state: "SUCCESS",
        businessName: business.profileData.businessName,
        errorField: undefined,
      }),
    });

    useMockBusiness(business);
    const onContinue = jest.fn();
    const { page } = renderSectorModal(onContinue);
    page.selectByValue("Sector", "clean-energy");
    submitSectorModal();
    await waitFor(() => {
      expect(onContinue).toHaveBeenCalled();
    });
  });
});
