import {
  ALL_LEGAL_STRUCTURES,
  BusinessUser,
  Destination,
  LegalStructure,
  OnboardingData,
  Roadmap,
  Step,
  Task,
  UserData,
} from "../lib/types/types";

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
    industry: "restaurant",
    legalStructure: randomLegalStructure(),
    ...overrides,
  };
};

export const generateRoadmap = (overrides: Partial<Roadmap>): Roadmap => {
  return {
    type: "restaurant",
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
    description: "some-description-" + randomInt(),
    destination: generateDestination({}),
    to_complete_must_have: ["some-to-complete-" + randomInt()],
    after_completing_will_have: ["some-after-comleting-" + randomInt()],
    ...overrides,
  };
};

export const generateDestination = (overrides: Partial<Destination>): Destination => {
  return {
    name: "some-name-" + randomInt(),
    link: "some-link-" + randomInt(),
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * ALL_LEGAL_STRUCTURES.length);
  return ALL_LEGAL_STRUCTURES[randomIndex];
};
