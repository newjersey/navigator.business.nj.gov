import { BusinessUser } from "../lib/types/BusinessUser";
import { BusinessForm } from "../lib/types/form";

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
