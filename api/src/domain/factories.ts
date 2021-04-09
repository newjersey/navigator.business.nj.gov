import { ALL_LEGAL_STRUCTURES, BusinessUser, LegalStructure, OnboardingData, UserData } from "./types";
import { ALL_INDUSTRIES, Industry } from "../../../web/lib/types/types";

export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  return {
    user: generateUser({}),
    onboardingData: generateOnboardingData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
    ...overrides,
  };
};

export const generateOnboardingData = (overrides: Partial<OnboardingData>): OnboardingData => {
  return {
    businessName: "some-business-name-" + randomInt(),
    industry: randomIndustry(),
    legalStructure: randomLegalStructure(),
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * ALL_LEGAL_STRUCTURES.length);
  return ALL_LEGAL_STRUCTURES[randomIndex];
};

export const randomIndustry = (): Industry => {
  const randomIndex = Math.floor(Math.random() * ALL_INDUSTRIES.length);
  return ALL_INDUSTRIES[randomIndex];
};
