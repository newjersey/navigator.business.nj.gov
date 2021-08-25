import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { OnboardingData, UserData, UserDataError } from "@/lib/types/types";
import { generateUseUserDataResponse } from "@/test/helpers";
import { generateOnboardingData, generateUserData } from "@/test/factories";

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

export const useMockOnboardingData = (onboardingData: Partial<OnboardingData>): void => {
  setMockUserDataResponse({
    userData: generateUserData({
      onboardingData: generateOnboardingData(onboardingData),
    }),
  });
};

export const setMockUserDataResponse = (overrides: Partial<UseUserDataResponse>): void => {
  mockUseUserData.mockReturnValue(
    generateUseUserDataResponse({
      update: jest.fn(),
      ...overrides,
    })
  );
};
