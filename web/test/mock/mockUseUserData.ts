import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { UserDataError } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import {
  generateProfileData,
  generateUserData,
  ProfileData,
  UserData, UserDataOverrides
} from "@businessnjgovnavigator/shared/";

const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

export const useMockUserData = (overrides: UserDataOverrides): void => {
  setMockUserDataResponse({ userData: generateUserData(overrides) });
};

export const useUndefinedUserData = (): void => {
  setMockUserDataResponse({ userData: undefined });
};

export const useMockUserDataError = (error: UserDataError): void => {
  setMockUserDataResponse({ error });
};

export const useMockProfileData = (profileData: Partial<ProfileData>): void => {
  setMockUserDataResponse({
    userData: generateUserData({
      profileData: generateProfileData(profileData),
      onboardingFormProgress: "COMPLETED",
    }),
  });
};

export const generateUseUserDataResponse = (overrides: Partial<UseUserDataResponse>): UseUserDataResponse => {
  const userData = overrides.userData ?? generateUserData({});
  return {
    userData,
    error: undefined,
    isLoading: false,
    refresh: jest.fn().mockResolvedValue({}),
    updateQueue: new UpdateQueueFactory(userData, jest.fn().mockResolvedValue({})),
    createUpdateQueue: jest.fn().mockResolvedValue({}),
    ...overrides,
  };
};

export const setMockUserDataResponse = (overrides: Partial<UseUserDataResponse>): void => {
  mockUseUserData.mockReturnValue(generateUseUserDataResponse({ ...overrides }));
};
