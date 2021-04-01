import { BusinessForm } from "./form";
import { ALL_LEGAL_STRUCTURES, BusinessUser, LegalStructure, UserData } from "./types";

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
    formData: generateFormData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
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
      businessType: "restaurant",
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
      businessStructure: randomLegalStructure(),
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

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * ALL_LEGAL_STRUCTURES.length);
  return ALL_LEGAL_STRUCTURES[randomIndex];
};
