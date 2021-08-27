import { randomInt } from "./migrations";

export interface v0UserData {
  user: v0BusinessUser;
  formData: v0BusinessForm;
  formProgress: v0FormProgress;
}

// ---------------- v0 types ----------------

type v0FormProgress = "UNSTARTED" | "COMPLETED";

type v0BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

type Restaurant = "restaurant";
type ECommerce = "e-commerce";
type HomeImprovementContractor = "home-contractor";
type Cosmetology = "cosmetology";

interface v0BusinessForm {
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    [k: string]: unknown;
  };
  businessType?: {
    businessType?: (Restaurant | ECommerce | HomeImprovementContractor | Cosmetology) & string;
    [k: string]: unknown;
  };
  businessName?: {
    businessName?: string;
    [k: string]: unknown;
  };
  businessDescription?: {
    businessDescription?: string;
    [k: string]: unknown;
  };
  businessStructure?: {
    businessStructure?:
      | "Sole Proprietorship"
      | "General Partnership"
      | "Limited Partnership (LP)"
      | "Limited Liability Partnership (LLP)"
      | "Limited Liability Company (LLC)"
      | "C-Corporation"
      | "S-Corporation"
      | "B-Corporation";
    [k: string]: unknown;
  };
  locations?: {
    locations?: [
      {
        zipCode?: string;
        license?: boolean;
        [k: string]: unknown;
      },
      ...{
        zipCode?: string;
        license?: boolean;
        [k: string]: unknown;
      }[]
    ];
    [k: string]: unknown;
  };
  [k: string]: unknown;
}

// ---------------- v0 factories ----------------

export const generateV0FormData = (overrides: Partial<v0BusinessForm>): v0BusinessForm => {
  return {
    user: {
      firstName: `some-firstname-${randomInt()}`,
      lastName: `some-lastname-${randomInt()}`,
      email: `some-email-${randomInt()}`,
      ...overrides.user,
    },
    businessType: {
      businessType: "restaurant",
      ...overrides.businessType,
    },
    businessName: {
      businessName: `some-business-name-${randomInt()}`,
      ...overrides.businessName,
    },
    businessDescription: {
      businessDescription: `some-description-${randomInt()}`,
      ...overrides.businessDescription,
    },
    businessStructure: {
      businessStructure: "Sole Proprietorship",
      ...overrides.businessStructure,
    },
    locations: {
      locations: [
        {
          zipCode: `some-zipcode-${randomInt()}`,
          license: false,
        },
      ],
      ...overrides.locations,
    },
  };
};

export const generateV0User = (overrides: Partial<v0BusinessUser>): v0BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};
