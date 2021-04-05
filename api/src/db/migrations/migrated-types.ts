import { randomInt, randomLegalStructure } from "../../domain/factories";

export type Restaurant = "restaurant";
export type ECommerce = "e-commerce";
export type HomeImprovementContractor = "home-contractor";
export type Cosmetology = "cosmetology";

export interface BusinessForm {
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
