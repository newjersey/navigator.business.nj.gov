import * as useUserModule from "@/lib/data-hooks/useUserData";
import { UseUserDataResponse } from "@/lib/data-hooks/useUserData";
import { OnboardingData, UserData } from "@/lib/types/types";
import { generateUseUserDataResponse } from "@/test/helpers";
import { generateOnboardingData, generateUserData } from "@/test/factories";

const mockUseUserData = (useUserModule as jest.Mocked<typeof useUserModule>).useUserData;
export const mockUpdate = jest.fn().mockResolvedValue({});

export const useMockUserData = (overrides: Partial<UserData>): void => {
  set({ userData: generateUserData(overrides) });
};

export const useMockOnboardingData = (onboardingData: Partial<OnboardingData>): void => {
  set({
    userData: generateUserData({
      onboardingData: generateOnboardingData(onboardingData),
    }),
  });
};

const set = (overrides: Partial<UseUserDataResponse>): void => {
  mockUseUserData.mockReturnValue(
    generateUseUserDataResponse({
      update: mockUpdate,
      ...overrides,
    })
  );
};
