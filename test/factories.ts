import { BusinessUser } from "../lib/types/BusinessUser";
import { BusinessForm } from "../lib/types/form";
import { Destination, Roadmap, StepsEntity, TasksEntity } from "../lib/types/roadmaps";
import { ALL_STEPS, StepId } from "../lib/types/steps";

export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateFormData = (overrides: Partial<BusinessForm>): BusinessForm => {
  return {
    user: {
      firstName: "some-firstname-" + randomInt(),
      lastName: "some-lastname-" + randomInt(),
      email: "some-email-" + randomInt(),
      ...overrides.user,
    },
    businessType: {
      businessType: "Restaurant",
      ...overrides.businessType,
    },
    businessName: {
      businessName: "some-business-name-" + randomInt(),
      ...overrides.businessName,
    },
    businessDescription: {
      businessDescription: "some-description-" + randomInt(),
      ...overrides.businessDescription,
    },
    businessStructure: {
      businessStructure: "LLC",
      ...overrides.businessStructure,
    },
    locations: {
      locations: [
        {
          zipCode: "some-zipcode-" + randomInt(),
          license: false,
        },
      ],
      ...overrides.locations,
    },
  };
};

export const generateRoadmap = (overrides: Partial<Roadmap>): Roadmap => {
  return {
    steps: [generateStep({})],
    ...overrides,
  };
};

export const generateStep = (overrides: Partial<StepsEntity>): StepsEntity => {
  return {
    step_number: randomInt(),
    id: randomStepId(),
    name: "some-name-" + randomInt(),
    description: "some-description-" + randomInt(),
    tasks: [generateTask({})],
    ...overrides,
  };
};

export const generateTask = (overrides: Partial<TasksEntity>): TasksEntity => {
  return {
    task_number: randomInt(),
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

export const randomStepId = (): StepId => {
  const randomIndex = Math.floor(Math.random() * ALL_STEPS.length);
  return ALL_STEPS[randomIndex];
};
