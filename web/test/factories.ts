import {
  FormationDisplayContent,
  NameAvailability,
  Preferences,
  Roadmap,
  SectionCompletion,
  SectionType,
  Step,
  Task,
  TaskLink,
} from "@/lib/types/types";
import { getSectionNames } from "@/lib/utils/helpers";
import {
  BusinessUser,
  Industries,
  Industry,
  LegalStructure,
  LegalStructures,
  LicenseData,
  LicenseStatusItem,
  LicenseStatusResult,
  Municipality,
  MunicipalityDetail,
  NameAndAddress,
  ProfileData,
  TaxFiling,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";

export const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );

export const generateSectionType = (): SectionType => {
  const num = randomInt();
  return num % 2 ? "PLAN" : "START";
};

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    externalStatus: {},
    receiveNewsletter: true,
    userTesting: true,
    ...overrides,
  };
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  return {
    user: generateUser({}),
    profileData: generateProfileData({}),
    formProgress: "COMPLETED",
    taskProgress: {},
    licenseData: generateLicenseData({}),
    preferences: generatePreferences({}),
    taxFilingData: generateTaxFilingData({}),
    formationData: undefined, // Placeholder
    ...overrides,
  };
};

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
    entityIdStatus: "UNKNOWN",
    filings: [generateTaxFiling({})],
    ...overrides,
  };
};

export const generateTaxFiling = (overrides: Partial<TaxFiling>): TaxFiling => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: dayjs().format("YYYY-MM-DD"),
    ...overrides,
  };
};

export const generateProfileData = (
  overrides: Partial<ProfileData>,
  isMobileLocation?: boolean
): ProfileData => {
  return {
    hasExistingBusiness: false,
    businessName: `some-business-name-${randomInt()}`,
    industryId: randomIndustry(isMobileLocation).id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(9).toString(),
    notes: `some-notes-${randomInt()}`,
    certificationIds: [],
    existingEmployees: randomInt(7).toString(),
    ...overrides,
  };
};

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateMunicipalityDetail = (overrides: Partial<MunicipalityDetail>): MunicipalityDetail => {
  return {
    id: `some-id-${randomInt()}`,
    townName: `some-town-name-${randomInt()}`,
    countyId: `some-county-id-${randomInt()}`,
    townDisplayName: `some-town-display-name-${randomInt()}`,
    townWebsite: `some-town-website-${randomInt()}`,
    countyName: `some-county-name-${randomInt()}`,
    countyClerkPhone: `some-phone-${randomInt()}`,
    countyClerkWebsite: `some-clerk-webpage-${randomInt()}`,
    countyWebsite: `some-county-website-${randomInt()}`,
    ...overrides,
  };
};

export const generatePreferences = (overrides: Partial<Preferences>): Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [randomInt()],
    ...overrides,
  };
};

export const generateRoadmap = (overrides: Partial<Roadmap>): Roadmap => {
  return {
    steps: [generateStep({})],
    ...overrides,
  };
};

export const generateSectionCompletion = (
  roadmap: Partial<Roadmap>,
  overrides: Partial<SectionCompletion>
): SectionCompletion => {
  const sectionNames = getSectionNames(roadmap as Roadmap);
  return {
    ...sectionNames.reduce((accumulator, currentValue: SectionType) => {
      accumulator[currentValue] = false;
      return accumulator;
    }, {} as SectionCompletion),
    ...overrides,
  };
};

export const generateStep = (overrides: Partial<Step>): Step => {
  return {
    step_number: randomInt(),
    name: `some-name-${randomInt()}`,
    timeEstimate: `some-time-estimate-${randomInt()}`,
    description: `some-description-${randomInt()}`,
    tasks: [generateTask({})],
    section: generateSectionType(),
    ...overrides,
  };
};

export const generateTask = (overrides: Partial<Task>): Task => {
  return {
    id: `some-id-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    urlSlug: `some-urlSlug-${randomInt()}`,
    callToActionLink: `some-link-${randomInt()}`,
    callToActionText: `some-call-to-action-${randomInt()}`,
    contentMd: `some-content-md-${randomInt()}`,
    postOnboardingQuestion: `some-post-onboarding-${randomInt()}`,
    unlockedBy: [generateTaskLink({})],
    ...overrides,
  };
};

export const generateTaskLink = (overrides: Partial<TaskLink>): TaskLink => {
  return {
    name: `some-name-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    urlSlug: `some-urlSlug-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    ...overrides,
  };
};

export const generateNameAvailability = (overrides: Partial<NameAvailability>): NameAvailability => {
  return {
    status: "UNAVAILABLE",
    similarNames: [`some-name-${randomInt()}`],
    ...overrides,
  };
};

export const generateNameAndAddress = (overrides: Partial<NameAndAddress>): NameAndAddress => {
  return {
    name: `some-name-${randomInt()}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    zipCode: `some-zipcode-${randomInt()}`,
    ...overrides,
  };
};

export const generateLicenseStatusItem = (overrides: Partial<LicenseStatusItem>): LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
    ...overrides,
  };
};

export const generateLicenseStatusResult = (overrides: Partial<LicenseStatusResult>): LicenseStatusResult => {
  return {
    status: "PENDING",
    checklistItems: [generateLicenseStatusItem({})],
    ...overrides,
  };
};

export const generateLicenseData = (overrides: Partial<LicenseData>): LicenseData => {
  return {
    nameAndAddress: generateNameAndAddress({}),
    completedSearch: false,
    items: [generateLicenseStatusItem({})],
    status: "PENDING",
    lastCheckedStatus: dayjs().toISOString(),
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * LegalStructures.length);
  return LegalStructures[randomIndex];
};

export const randomIndustry = (isMobileLocation = false): Industry => {
  const filteredIndustries = Industries.filter((x: Industry) => x.isMobileLocation === isMobileLocation);
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};

export const generateFormationDisplayContent = (
  overrides: Partial<FormationDisplayContent>
): FormationDisplayContent => ({
  businessSuffix: {
    contentMd: `some-business-suffix-content-${randomInt()}`,
    placeholder: `some-business-suffix-placeholder-${randomInt()}`,
  },
  businessStartDate: {
    contentMd: `some-business-start-date-content-${randomInt()}`,
  },
  businessAddressLine1: {
    contentMd: `some-business-address-line-1-content-${randomInt()}`,
    placeholder: `some-business-address-line-1-placeholder-${randomInt()}`,
  },
  businessAddressLine2: {
    contentMd: `some-business-address-line-2-content-${randomInt()}`,
    placeholder: `some-business-address-line-2-placeholder-${randomInt()}`,
  },
  businessAddressState: {
    contentMd: `some-business-address-state-content-${randomInt()}`,
    placeholder: `some-business-address-state-placeholder-${randomInt()}`,
  },
  businessAddressZipCode: {
    contentMd: `some-business-address-zip-code-content-${randomInt()}`,
    placeholder: `some-business-address-zip-code-placeholder-${randomInt()}`,
  },

  agentNumberOrManual: {
    contentMd: `some-agent-number-or-manual-content-${randomInt()}`,
    radioButtonNumberText: `some-agent-number-or-manual-radio-number-text-${randomInt()}`,
    radioButtonManualText: `some-agent-number-or-manual-radio-manual-text-${randomInt()}`,
  },
  agentNumber: {
    contentMd: `some-agent-number-content-${randomInt()}`,
    placeholder: `some-agent-number-placeholder-${randomInt()}`,
  },
  agentName: {
    contentMd: `some-agent-name-content-${randomInt()}`,
    placeholder: `some-agent-name-placeholder-${randomInt()}`,
  },
  agentEmail: {
    contentMd: `some-agent-email-content-${randomInt()}`,
    placeholder: `some-agent-email-placeholder-${randomInt()}`,
  },
  agentOfficeAddressLine1: {
    contentMd: `some-agent-office-address-line-1-content-${randomInt()}`,
    placeholder: `some-business-address-line-1-placeholder-${randomInt()}`,
  },
  agentOfficeAddressLine2: {
    contentMd: `some-agent-office-address-line-2-content-${randomInt()}`,
    placeholder: `some-business-address-line-2-placeholder-${randomInt()}`,
  },
  agentOfficeAddressCity: {
    contentMd: `some-agent-office-address-city-content-${randomInt()}`,
    placeholder: `some-agent-office-address-city-placeholder-${randomInt()}`,
  },
  agentOfficeAddressState: {
    contentMd: `some-agent-office-address-state-content-${randomInt()}`,
    placeholder: `some-agent-office-address-state-placeholder-${randomInt()}`,
  },
  agentOfficeAddressZipCode: {
    contentMd: `some-agent-office-address-zip-code-content-${randomInt()}`,
    placeholder: `some-agent-office-address-zip-code-placeholder-${randomInt()}`,
  },
  signer: {
    contentMd: `some-signer-content- ${randomInt()}`,
    placeholder: `some-signer-placeholder-${randomInt()}`,
  },
  additionalSigners: {
    contentMd: `some-additional-signer-content- ${randomInt()}`,
    placeholder: `some-additional-signer-placeholder-${randomInt()}`,
  },
  paymentType: {
    contentMd: `some-payment-type-content-${randomInt()}`,
    placeholder: `some-payment-type-placeholder-${randomInt()}`,
  },
  disclaimer: {
    contentMd: `some-disclaimer-${randomInt()}`,
  },
  notification: {
    contentMd: `some-notification-${randomInt()}`,
  },
  optInAnnualReport: {
    contentMd: `some-opt-in-annual-report-content-${randomInt()}`,
  },
  optInCorpWatch: {
    contentMd: `some-opt-in-corp-watch-content-${randomInt()}`,
  },
  ...overrides,
});
