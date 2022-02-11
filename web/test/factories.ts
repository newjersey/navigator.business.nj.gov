import {
  AllCounties,
  Certification,
  County,
  FormationDisplayContent,
  Funding,
  FundingBusinessStage,
  FundingHomeBased,
  FundingProgramFrequency,
  FundingStatus,
  FundingType,
  NameAvailability,
  OperateReference,
  Roadmap,
  SectionCompletion,
  SectionType,
  Step,
  Task,
  TaskLink,
} from "@/lib/types/types";
import { getSectionNames } from "@/lib/utils/helpers";
import {
  AllBusinessSuffixes,
  arrayOfSectors as sectors,
  arrayOfStateObjects as states,
  BusinessSuffix,
  BusinessUser,
  FormationData,
  FormationFormData,
  FormationMember,
  FormationSubmitError,
  FormationSubmitResponse,
  GetFilingResponse,
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
  Preferences,
  ProfileData,
  SectorType,
  TaxFiling,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import { randomIntFromInterval } from "./helpers";

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
    formationData: generateFormationData({}),
    ...overrides,
  };
};

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
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
    dateOfFormation: dayjs().format("YYYY-MM-DD"),
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(9).toString(),
    notes: `some-notes-${randomInt()}`,
    ownershipTypeIds: [],
    existingEmployees: randomInt(7).toString(),
    taxPin: randomInt(4).toString(),
    sectorId: randomSector().id,
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
    required: Math.random() < 0.5,
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

export const randomSector = (): SectorType => {
  const randomIndex = Math.floor(Math.random() * sectors.length);
  return sectors[randomIndex];
};

export const randomIndustry = (isMobileLocation = false): Industry => {
  const filteredIndustries = Industries.filter((x: Industry) => x.isMobileLocation === isMobileLocation);
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};

export const generateFormationDisplayContent = (
  overrides: Partial<FormationDisplayContent>
): FormationDisplayContent => ({
  businessNameAndLegalStructure: {
    contentMd: `some-business-name-and-legal-structure-content-${randomInt()}`,
  },
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
  memberName: {
    contentMd: `some-memberName-content-${randomInt()}`,
    placeholder: `some-memberName-placeholder-${randomInt()}`,
  },
  memberAddressLine1: {
    contentMd: `some-memberAddressLine1-content-${randomInt()}`,
    placeholder: `some-memberAddressLine1-placeholder-${randomInt()}`,
  },
  memberAddressLine2: {
    contentMd: `some-memberAddressLine2-content-${randomInt()}`,
    placeholder: `some-memberAddressLine2-placeholder-${randomInt()}`,
  },
  memberAddressCity: {
    contentMd: `some-memberAddressCity-content-${randomInt()}`,
    placeholder: `some-memberAddressCity-placeholder-${randomInt()}`,
  },
  memberAddressState: {
    contentMd: `some-memberAddressState-content-${randomInt()}`,
    placeholder: `some-memberAddressState-placeholder-${randomInt()}`,
  },
  memberAddressZipCode: {
    contentMd: `some-memberAddressZipCode-content-${randomInt()}`,
    placeholder: `some-memberAddressZipCode-placeholder-${randomInt()}`,
  },
  members: {
    contentMd: `some-members-content-${randomInt()}`,
    placeholder: `some-members-placeholder-${randomInt()}`,
  },
  membersModal: {
    contentMd: `some-membersModal-content-${randomInt()}`,
    sameNameCheckboxText: `some-membersModal-checkbox-${randomInt()}`,
  },
  signer: {
    contentMd: `some-signer-content- ${randomInt()}`,
    placeholder: `some-signer-placeholder-${randomInt()}`,
  },
  additionalSigners: {
    contentMd: `some-additional-signer-content- ${randomInt()}`,
    placeholder: `some-additional-signer-placeholder-${randomInt()}`,
  },
  services: {
    contentMd: `some-payment-type-content-${randomInt()}`,
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
  officialFormationDocument: {
    contentMd: `some-official-formation-document-content-${randomInt()}`,
    cost: randomInt(),
  },
  certificateOfStanding: {
    contentMd: `some-certificate-of-standing-content-${randomInt()}`,
    cost: randomInt(),
    optionalLabel: `some-certificate-of-standing-optional-label-${randomInt()}`,
  },
  certifiedCopyOfFormationDocument: {
    contentMd: `some-certified-copy-of-formation-document-content-${randomInt()}`,
    cost: randomInt(),
    optionalLabel: `some-certified-copy-of-formation-document-optional-label-${randomInt()}`,
  },
  contactInformation: {
    contentMd: `some-contact-information-content-${randomInt()}`,
  },
  contactFirstName: {
    contentMd: `some-contact-first-name-content-${randomInt()}`,
    placeholder: `some-contact-first-name-placeholder-${randomInt()}`,
  },
  contactLastName: {
    contentMd: `some-contact-last-name-content-${randomInt()}`,
    placeholder: `some-contact-last-name-placeholder-${randomInt()}`,
  },
  contactPhoneNumber: {
    contentMd: `some-contact-phone-number-content-${randomInt()}`,
    placeholder: `some-contact-phone-number-placeholder-${randomInt()}`,
  },
  reviewPageBusinessName: {
    contentMd: `some-business-name-${randomInt()}`,
  },
  reviewPageLegalStructure: {
    contentMd: `some-legal-structure-${randomInt()}`,
  },
  reviewPageAddress: { contentMd: `some-address-content-${randomInt()}` },
  reviewPageBusinessStartDate: { contentMd: `some-start-date-content-${randomInt()}` },
  reviewPageBusinessSuffix: { contentMd: `some-business-suffix-content-${randomInt()}` },
  reviewPageEmail: { contentMd: `some-email-content-${randomInt()}` },
  reviewPageMemberName: { contentMd: `some-member-name-content-${randomInt()}` },
  reviewPageRegisteredAgentName: { contentMd: `some-registered-agent-name-content-${randomInt()}` },
  reviewPageSignerName: { contentMd: `some-signer-name-content-${randomInt()}` },
  reviewPageLocation: { contentMd: `some-location-content-${randomInt()}` },
  reviewPageRegisteredAgent: { contentMd: `some-registered-agent-content-${randomInt()}` },
  reviewPageRegisteredAgentNumber: { contentMd: `some-registered-agent-number-content-${randomInt()}` },
  reviewPageSignatures: { contentMd: `some-signature-content-${randomInt()}` },
  reviewPageMembers: { contentMd: `some-members-content-${randomInt()}` },
  ...overrides,
});

export const generateFormationFormData = (overrides: Partial<FormationFormData>): FormationFormData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: randomBusinessSuffix(),
    businessStartDate: dayjs().add(1, "days").format("YYYY-MM-DD"),
    businessAddressLine1: `some-address-1-${randomInt()}`,
    businessAddressLine2: `some-address-2-${randomInt()}`,
    businessAddressState: "NJ",
    businessAddressZipCode: randomIntFromInterval("07001", "08999").toString(),
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}@gmail.com`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: randomIntFromInterval("07001", "08999").toString(),
    members: [generateFormationMember({})],
    signer: `some-signer-${randomInt()}`,
    additionalSigners: [`some-additional-signer-${randomInt()}`],
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    ...overrides,
  };
};

const generateZipCode = () => {
  const zip = randomIntFromInterval("1", "99999").toString();
  return "0".repeat(5 - zip.length) + zip;
};

const generateStateItem = () => states[randomIntFromInterval("0", (states.length - 1).toString())];

export const generateStateInput = () => generateStateItem()[randomInt() % 2 ? "shortCode" : "name"];

export const generateFormationMember = (overrides: Partial<FormationMember>): FormationMember => ({
  name: `some-members-name-${randomInt()}`,
  addressLine1: `some-members-address-1-${randomInt()}`,
  addressLine2: `some-members-address-2-${randomInt()}`,
  addressCity: `some-members-address-city-${randomInt()}`,
  addressState: generateStateItem().shortCode,
  addressZipCode: generateZipCode(),
  ...overrides,
});

export const generateFormationData = (overrides: Partial<FormationData>): FormationData => {
  return {
    formationFormData: generateFormationFormData({}),
    formationResponse: undefined,
    getFilingResponse: undefined,
    ...overrides,
  };
};

export const generateFormationSubmitResponse = (
  overrides: Partial<FormationSubmitResponse>
): FormationSubmitResponse => {
  return {
    success: !!(randomInt() % 2),
    token: `some-token-${randomInt()}`,
    formationId: `some-id-${randomInt()}`,
    redirect: `some-redirect-${randomInt()}`,
    errors: [],
    ...overrides,
  };
};

export const generateFormationSubmitError = (
  overrides: Partial<FormationSubmitError>
): FormationSubmitError => {
  return {
    field: `some-field-${randomInt()}`,
    message: `some-message-${randomInt()}`,
    type: randomInt() % 2 ? "UNKNOWN" : "RESPONSE",
    ...overrides,
  };
};

export const generateGetFilingResponse = (overrides: Partial<GetFilingResponse>): GetFilingResponse => {
  return {
    success: true,
    entityId: `some-entity-${randomInt()}`,
    transactionDate: dayjs().toISOString(),
    confirmationNumber: `some-confirmation-number-${randomInt()}`,
    formationDoc: `some-formation-doc-${randomInt()}`,
    standingDoc: `some-standing-doc-${randomInt()}`,
    certifiedDoc: `some-certified-doc-${randomInt()}`,
    ...overrides,
  };
};

export const generateFunding = (overrides: Partial<Funding>): Funding => {
  return {
    id: `some-id-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    benefits: `some-benefits-${randomInt()}`,
    eligibility: `some-eligibility-${randomInt()}`,
    fundingType: randomFundingType(),
    agency: [randomInt() % 2 ? "NJEDA" : "NJDOL"],
    publishStageArchive: null,
    openDate: dayjs().toISOString(),
    dueDate: dayjs().toISOString(),
    status: randomFundingStatus(),
    programFrequency: randomFundingProgramFrequency(),
    businessStage: randomFundingBusinessStage(),
    businessSize: ">200",
    homeBased: randomFundingHomeBased(),
    mwvb: `some-mwvb-${randomInt()}`,
    preferenceGiven: null,
    county: [randomCounty()],
    sector: [randomSector().id],
    ...overrides,
  };
};

export const generateCertification = (overrides: Partial<Certification>): Certification => {
  return {
    id: `some-id-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    agency: [randomInt() % 2 ? "NJEDA" : "NJDOL"],
    ...overrides,
  };
};

export const generateOperateReference = (overrides: Partial<OperateReference>): OperateReference => {
  return {
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    urlPath: `some-url-path-${randomInt()}`,
    ...overrides,
  };
};

export const randomBusinessSuffix = (): BusinessSuffix => {
  const randomIndex = Math.floor(Math.random() * AllBusinessSuffixes.length);
  return AllBusinessSuffixes[randomIndex] as BusinessSuffix;
};

export const randomFundingStatus = (): FundingStatus => {
  const all = ["open", "deadline", "first-come, first-served", "closed"];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as FundingStatus;
};

export const randomFundingProgramFrequency = (): FundingProgramFrequency => {
  const all = ["annual", "ongoing", "reoccuring", "one-time", "pilot", "other"];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as FundingProgramFrequency;
};

export const randomFundingBusinessStage = (): FundingBusinessStage => {
  const all = ["early-stage", "operating", "both"];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as FundingBusinessStage;
};

export const randomFundingType = (): FundingType => {
  const all = [
    "tax credit",
    "loan",
    "grant",
    "technical assistance",
    "hiring and employee training support",
    "tax exemption",
  ];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as FundingType;
};

export const randomFundingHomeBased = (): FundingHomeBased => {
  const all = ["yes", "no", "unknown"];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as FundingHomeBased;
};

export const randomCounty = (): County => {
  const randomIndex = Math.floor(Math.random() * AllCounties.length);
  return AllCounties[randomIndex] as County;
};
