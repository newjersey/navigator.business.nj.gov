import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { UserDataError } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import {
  generateProfileData,
  generateUserData,
  generateUserDataForBusiness,
  ProfileData,
} from "@businessnjgovnavigator/shared/";
import { generateBusiness } from "@businessnjgovnavigator/shared/test";
import { Business, UserData } from "@businessnjgovnavigator/shared/userData";

const mockUseUserData = (useUserModule as vi.Mocked<typeof useUserModule>).useUserData;

export const useMockBusiness = (overrides: Partial<Business>): void => {
  const business = generateBusiness(overrides);
  setMockUserDataResponse({ userData: generateUserDataForBusiness(business) });
};

export const useMockUserData = (overrides: Partial<UserData>): void => {
  const userData = generateUserData(overrides);
  setMockUserDataResponse({ userData });
};

export const useUndefinedUserData = (): void => {
  setMockUserDataResponse({ userData: undefined });
};

export const useMockUserDataError = (error: UserDataError): void => {
  setMockUserDataResponse({ error });
};

export const useMockProfileData = (profileData: Partial<ProfileData>): void => {
  const business = generateBusiness({
    profileData: generateProfileData(profileData),
    onboardingFormProgress: "COMPLETED",
  });

  const userData = generateUserDataForBusiness(business);
  setMockUserDataResponse({ userData });
};

export const generateUseUserDataResponse = (overrides: Partial<UseUserDataResponse>): UseUserDataResponse => {
  const userData = overrides.userData ?? generateUserData({});
  const business =
    overrides.userData === undefined ? undefined : userData.businesses[userData.currentBusinessId];
  return {
    userData,
    business,
    error: undefined,
    isLoading: false,
    refresh: vi.fn().mockResolvedValue({}),
    updateQueue: new UpdateQueueFactory(userData, vi.fn().mockResolvedValue({})),
    createUpdateQueue: vi.fn().mockResolvedValue({}),
    hasCompletedFetch: true,
    ...overrides,
  };
};

export const setMockUserDataResponse = (overrides: Partial<UseUserDataResponse>): void => {
  mockUseUserData.mockReturnValue(generateUseUserDataResponse({ ...overrides }));
};
