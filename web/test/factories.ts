import {
  BusinessUser,
  Industry,
  LegalStructure,
  Municipality,
  MunicipalityDetail,
  OnboardingData,
  Roadmap,
  Step,
  Task,
  UserData,
} from "../lib/types/types";
import { ALL_LEGAL_STRUCTURES_ORDERED } from "../display-content/LegalStructureLookup";
import { ALL_INDUSTRIES_ORDERED } from "../display-content/IndustryLookup";

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
    municipality: generateMunicipality({}),
    ...overrides,
  };
};

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: "some-display-name-" + randomInt(),
    name: "some-name-" + randomInt(),
    county: "some-county-" + randomInt(),
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateMunicipalityDetail = (overrides: Partial<MunicipalityDetail>): MunicipalityDetail => {
  return {
    id: "some-id-" + randomInt(),
    townName: "some-town-name-" + randomInt(),
    countyId: "some-county-id-" + randomInt(),
    townDisplayName: "some-town-display-name-" + randomInt(),
    townWebsite: "some-town-website-" + randomInt(),
    countyName: "some-county-name-" + randomInt(),
    countyClerkPhone: "some-phone-" + randomInt(),
    countyClerkWebsite: "some-clerk-webpage-" + randomInt(),
    countyWebsite: "some-county-website-" + randomInt(),
    ...overrides,
  };
};

export const generateRoadmap = (overrides: Partial<Roadmap>): Roadmap => {
  return {
    type: randomIndustry(),
    steps: [generateStep({})],
    ...overrides,
  };
};

export const generateStep = (overrides: Partial<Step>): Step => {
  return {
    step_number: randomInt(),
    id: "some-id-" + randomInt(),
    name: "some-name-" + randomInt(),
    timeEstimate: "some-time-estimate-" + randomInt(),
    description: "some-description-" + randomInt(),
    tasks: [generateTask({})],
    ...overrides,
  };
};

export const generateTask = (overrides: Partial<Task>): Task => {
  return {
    id: "some-id-" + randomInt(),
    name: "some-name-" + randomInt(),
    callToActionLink: "some-link-" + randomInt(),
    callToActionText: "some-call-to-action-" + randomInt(),
    contentMd: "some-content-md-" + randomInt(),
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * ALL_LEGAL_STRUCTURES_ORDERED.length);
  return ALL_LEGAL_STRUCTURES_ORDERED[randomIndex];
};

export const randomIndustry = (): Industry => {
  const randomIndex = Math.floor(Math.random() * ALL_INDUSTRIES_ORDERED.length);
  return ALL_INDUSTRIES_ORDERED[randomIndex];
};
