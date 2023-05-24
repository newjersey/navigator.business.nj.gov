import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { UserDataError } from "@/lib/types/types";
import { UpdateQueueFactory } from "@/lib/UpdateQueue";
import {
  generateProfileData,
  generateUserData,
  ProfileData,
  UserData,
} from "@businessnjgovnavigator/shared/";

const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;

export const useMockUserData = (overrides: Partial<UserData>): void => {
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
  const update = overrides.update ?? jest.fn().mockResolvedValue({});
  const userData = overrides.userData ?? generateUserData({});
  return {
    update,
    userData,
    error: undefined,
    isLoading: false,
    refresh: jest.fn().mockResolvedValue({}),
    updateQueue: new UpdateQueueFactory(userData, update),
    ...overrides,
  };
};

export const setMockUserDataResponse = (overrides: Partial<UseUserDataResponse>): void => {
  mockUseUserData.mockReturnValue(
    generateUseUserDataResponse({
      update: jest.fn(),
      ...overrides,
    })
  );
};
