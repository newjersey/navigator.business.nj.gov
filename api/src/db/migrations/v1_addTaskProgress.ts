import { v0UserData } from "./v0_userData";
import { randomInt } from "./migrations";

export interface v1UserData {
  user: v1BusinessUser;
  formData: v1BusinessForm;
  formProgress: v1FormProgress;
  taskProgress: Record<string, v1TaskProgress>;
  version: number;
}

export const migrate_v0_to_v1 = (v0Data: v0UserData): v1UserData => {
  return {
    ...v0Data,
    taskProgress: {},
    version: 1,
  };
};

// ---------------- v1 types ----------------

type v1TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type v1FormProgress = "UNSTARTED" | "COMPLETED";

type v1BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

type Restaurant = "restaurant";
type ECommerce = "e-commerce";
type HomeImprovementContractor = "home-contractor";
type Cosmetology = "cosmetology";

interface v1BusinessForm {
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

// ---------------- v1 factories ----------------

export const generateV1User = (overrides: Partial<v1BusinessUser>): v1BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateV1FormData = (overrides: Partial<v1BusinessForm>): v1BusinessForm => {
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
      businessStructure: "Sole Proprietorship",
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
