import { ActiveUser } from "@/lib/auth/AuthContext";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import {
  arrayOfFundingAgencies,
  BusinessPersona,
  createEmptyFormationFormData,
  CrtkData,
  FormationAddress,
  FormationData,
  FormationSubmitError,
  FundingAgency,
  generateProfileData,
  getCurrentDateISOString,
  Industry,
  InputFile,
  LegalStructure,
  LegalStructures,
  LicenseTaskId,
  NameAvailability,
  OperatingPhaseId,
  OperatingPhases,
  OwnershipType,
  arrayOfOwnershipTypes as ownershipTypes,
  ProfileData,
  PublicFilingLegalType,
  publicFilingLegalTypes,
  randomInt,
  randomIntFromInterval,
  SectionType,
  taskIdLicenseNameMapping,
} from "@businessnjgovnavigator/shared";
import {
  filterRandomIndustry,
  randomIndustry,
  randomSector,
} from "@businessnjgovnavigator/shared/test";
import {
  AllCounties,
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
  Certification,
  County,
  FormationDbaContent,
  Funding,
  FundingBusinessStage,
  FundingCertifications,
  FundingHomeBased,
  FundingProgramFrequency,
  FundingStatus,
  FundingType,
  LicenseEventType,
  NaicsCodeObject,
  OperateReference,
  Opportunity,
  OutageConfig,
  Roadmap,
  SidebarCardContent,
  Step,
  Task,
  TaskLink,
  TaskWithLicenseTaskId,
  TaskWithoutLinks,
  XrayRenewalCalendarEventType,
} from "@businessnjgovnavigator/shared/types";
import { WebflowItem } from "../src/scripts/webflow/types";
import type { Funding as FundingExport } from "../src/scripts/fundingExport";

export const generateSectionType = (): SectionType => {
  const num = randomInt();
  return num % 2 ? "PLAN" : "START";
};

export const getProfileDataForUnfilteredOpportunities = (): ProfileData => {
  return generateProfileData({
    operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
    homeBasedBusiness: false,
    municipality: undefined,
    existingEmployees: "1",
    sectorId: undefined,
    ownershipTypeIds: [],
  });
};

export const generateNaicsObject = (
  overrides: Partial<NaicsCodeObject>,
  SixDigitNaicsCode?: number,
): NaicsCodeObject => {
  const sixNaicsCode = SixDigitNaicsCode ?? randomInt(6);
  return {
    SixDigitDescription: `some-six-digit-description-${randomInt()}`,
    SixDigitCode: sixNaicsCode,
    FourDigitDescription: `some-four-digit-description-${randomInt()}`,
    FourDigitCode: Number.parseInt(sixNaicsCode.toString().slice(0, 4)),
    TwoDigitDescription: `some-two-digit-description-${randomInt()}`,
    TwoDigitCode: [Number.parseInt(sixNaicsCode.toString().slice(0, 2))],
    industryIds: [randomIndustry().name],
    ...overrides,
  };
};

export const generateRoadmap = (overrides: Partial<Roadmap>): Roadmap => {
  return {
    steps: [generateStep({})],
    tasks: [generateTask({})],
    ...overrides,
  };
};

export const generateStep = (overrides: Partial<Step>): Step => {
  return {
    stepNumber: randomInt(),
    name: `some-name-${randomInt()}`,
    timeEstimate: `some-time-estimate-${randomInt()}`,
    description: `some-description-${randomInt()}`,
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
    stepNumber: randomInt(),
    callToActionLink: `some-link-${randomInt()}`,
    callToActionText: `some-call-to-action-${randomInt()}`,
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    contentMd: `some-content-md-${randomInt()}`,
    unlockedBy: [generateTaskLink({})],
    required: Math.random() < 0.5,
    agencyId: `some-agency-${randomInt()}`,
    agencyAdditionalContext: `some-agency-${randomInt()}`,
    formName: `some-form-${randomInt()}`,
    requiresLocation: Math.random() < 0.5,
    ...overrides,
  };
};

export const generateXrayRenewalCalendarEvent = (
  overrides: Partial<XrayRenewalCalendarEventType>,
): XrayRenewalCalendarEventType => {
  return {
    issuingAgency: `some-issuing-agency-${randomInt()}`,
    eventDisplayName: `some-event-display-name-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-md-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateLicenseTask = (
  overrides: Partial<TaskWithLicenseTaskId>,
): TaskWithLicenseTaskId => {
  const licenseTaskId = randomElementFromArray(
    Object.keys(taskIdLicenseNameMapping),
  ) as LicenseTaskId;
  return {
    ...generateTask({}),
    id: licenseTaskId,
    ...overrides,
  };
};

export const generateTaskWithoutLinks = (
  overrides: Partial<TaskWithoutLinks>,
): TaskWithoutLinks => {
  return {
    id: `some-id-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-urlSlug-${randomInt()}`,
    callToActionLink: `some-link-${randomInt()}`,
    callToActionText: `some-call-to-action-${randomInt()}`,
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    contentMd: `some-content-md-${randomInt()}`,
    required: Math.random() < 0.5,
    agencyId: `some-agency-${randomInt()}`,
    agencyAdditionalContext: `some-agency-${randomInt()}`,
    formName: `some-form-${randomInt()}`,
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

export const generateNameAvailability = (
  overrides: Partial<NameAvailability>,
): NameAvailability => {
  return {
    status: "UNAVAILABLE",
    similarNames: [`some-name-${randomInt()}`],
    lastUpdatedTimeStamp: "2023-04-03T20:08:58Z",
    ...overrides,
  };
};

export const generateFormationDbaContent = (
  overrides: Partial<FormationDbaContent>,
): FormationDbaContent => ({
  Authorize: generateTaskWithoutLinks({
    contentMd: "start ${beginIndentationSection} middle ${endIndentationSection} after",
  }),
  DbaResolution: generateTaskWithoutLinks({}),
  Formation: generateTaskWithoutLinks({}),
  ...overrides,
});

export const generateSidebarCardContent = (
  overrides: Partial<SidebarCardContent>,
): SidebarCardContent => {
  return {
    contentMd: `some-content-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    header: `some-header-${randomInt()}`,
    ctaText: `some-cta-${randomInt()}`,
    preBodySpanButtonText: `some-pre-body-button-text-${randomInt()}`,
    notStartedHeader: `some-not-started-header-${randomInt()}`,
    completedHeader: `some-completed-header-${randomInt()}`,
    hasCloseButton: !!(randomInt() % 2),
    ...overrides,
  };
};

export const generateEmptyFormationData = (): FormationData => {
  return {
    formationFormData: createEmptyFormationFormData(),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    dbaBusinessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
  };
};

export const generateFormationSubmitError = (
  overrides: Partial<FormationSubmitError>,
): FormationSubmitError => {
  return {
    field: `some-field-${randomInt()}`,
    message: `some-message-${randomInt()}`,
    type: randomInt() % 2 ? "UNKNOWN" : "RESPONSE",
    ...overrides,
  };
};

export const generateInputFile = (overrides: Partial<InputFile>): InputFile => {
  return {
    base64Contents: `some-base-64-contents-${randomInt()}`,
    fileType: randomElementFromArray(["PNG", "PDF"]),
    sizeInBytes: randomInt(),
    filename: `some-filename-${randomInt()}`,
    ...overrides,
  };
};

export const randomFundingCertification = (): FundingCertifications => {
  const all = [
    "woman-owned",
    "minority-owned",
    "veteran-owned",
    "disabled-veteran",
    "small-business-enterprise",
    "disadvantaged-business-enterprise",
    "emerging-small-business-enterprise",
  ];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as FundingCertifications;
};

export const generateFunding = (overrides: Partial<Funding>): Funding => {
  return {
    id: `some-id-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    sidebarCardBodyText: `some-sidebar-card-body-text-${randomInt()}`,
    fundingType: randomFundingType(),
    agency: [randomElementFromArray(arrayOfFundingAgencies as FundingAgency[]).id],
    publishStageArchive: null,
    openDate: getCurrentDateISOString(),
    dueDate: "",
    status: "rolling application",
    programFrequency: randomFundingProgramFrequency(),
    businessStage: randomFundingBusinessStage(),
    employeesRequired: ">200",
    homeBased: randomFundingHomeBased(),
    certifications: [randomFundingCertification()],
    preferenceForOpportunityZone: null,
    county: [randomCounty()],
    sector: [randomSector().id],
    programPurpose: `some-purpose-${randomInt()}`,
    agencyContact: `some-contact-${randomInt()}`,
    isNonprofitOnly: false,
    priority: false,
    minEmployeesRequired: undefined,
    maxEmployeesRequired: undefined,
    ...overrides,
  };
};

export const generateAnytimeActionTask = (
  overrides: Partial<AnytimeActionTask>,
): AnytimeActionTask => {
  return {
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    type: "task",
    category: [
      { categoryName: `Category ${randomInt()}`, categoryId: `something-${randomInt()}-something` },
    ],
    urlSlug: `some-url-slug-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    issuingAgency: `some-issuing-agency-${randomInt()}`,
    industryIds: [`some-industry-id-${randomInt()}`],
    sectorIds: [`some-sector-id-${randomInt()}`],
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    applyToAllUsers: false,
    synonyms: [`some-synonym-${randomInt()}`],
    ...overrides,
  };
};

export const generateAnytimeActionLicenseReinstatement = (
  overrides: Partial<AnytimeActionLicenseReinstatement>,
): AnytimeActionLicenseReinstatement => {
  return {
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    issuingAgency: `some-issusing-agency-${randomInt()}`,
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    licenseName: randomElementFromArray(Object.values(taskIdLicenseNameMapping)),
    synonyms: [`some-synonym-${randomInt()}`],
    category: [
      {
        categoryName: `Reactivate My Expired Permit, License or Registration`,
        categoryId: `something-id-something`,
      },
    ],
    type: "license-reinstatement",
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
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    sidebarCardBodyText: `some-sidebar-card-body-text-${randomInt()}`,
    agency: [randomElementFromArray(arrayOfFundingAgencies as FundingAgency[]).id],
    applicableOwnershipTypes: [randomOwnershipType().id],
    isSbe: false,
    ...overrides,
  };
};

export const generateOpportunity = (overrides: Partial<Opportunity>): Opportunity => {
  return {
    id: `some-id-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    sidebarCardBodyText: `some-sidebar-card-body-text-${randomInt()}`,
    ...overrides,
  };
};

export const generateOperateReference = (
  overrides: Partial<OperateReference>,
): OperateReference => {
  return {
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    urlPath: `some-url-path-${randomInt()}`,
    ...overrides,
  };
};

export const generateLicenseEvent = (overrides: Partial<LicenseEventType>): LicenseEventType => {
  const id = randomInt(4);
  return {
    issuingAgency: `some-issusing-agency-${randomInt()}`,
    disclaimerText: `some-disclaimer-text-${randomInt()}`,
    renewalEventDisplayName: `some-renewal-event-${id}`,
    expirationEventDisplayName: `some-expiration-event-${id}`,
    summaryDescriptionMd: `some-summary-${id}`,
    filename: `some-filename-${id}`,
    urlSlug: `some-url-slug-${id}`,
    callToActionLink: `some-cta-link-${id}`,
    callToActionText: `some-cta-text-${id}`,
    contentMd: `some-content-${id}`,
    licenseName: randomElementFromArray(Object.values(taskIdLicenseNameMapping)),
    ...overrides,
  };
};

export const generateOutageConfig = (overrides: Partial<OutageConfig>): OutageConfig => {
  return {
    FEATURE_ENABLE_OUTAGE_ALERT_BAR: randomInt() % 2 === 0,
    OUTAGE_ALERT_MESSAGE: `some-message-${randomInt()}`,
    OUTAGE_ALERT_TYPE: randomElementFromArray(["ALL", "LOGGED_IN_ONLY", "UNREGISTERED_ONLY"]),
    ...overrides,
  };
};

export const generateActiveUser = (overrides: Partial<ActiveUser>): ActiveUser => {
  return {
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    encounteredMyNjLinkingError: false,
    ...overrides,
  };
};

export const generateAddress = (overrides: Partial<FormationAddress>): FormationAddress => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressMunicipality: undefined,
    addressState: undefined,
    addressZipCode: `0${randomIntFromInterval("7001", "8999")}`,
    addressCity: `some-city-${randomInt()}`,
    addressProvince: undefined,
    addressCountry: undefined,
    businessLocationType: undefined,
    ...overrides,
  };
};

export const randomPublicFilingLegalType = (): PublicFilingLegalType => {
  return randomElementFromArray(
    publicFilingLegalTypes as unknown as string[],
  ) as PublicFilingLegalType;
};

export const randomFundingStatus = (): FundingStatus => {
  const all = ["rolling application", "deadline", "first come, first serve", "closed"];
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

export const allLegalStructuresOfType = ({
  type,
}: {
  type: "publicFiling" | "tradeName";
}): LegalStructure[] => {
  if (type === "publicFiling") {
    return LegalStructures.filter((item) => {
      return item.requiresPublicFiling;
    });
  }

  if (type === "tradeName") {
    return LegalStructures.filter((item) => {
      return item.hasTradeName;
    });
  }

  return [];
};

export const randomOwnershipType = (): OwnershipType => {
  const randomIndex = Math.floor(Math.random() * ownershipTypes.length);
  return ownershipTypes[randomIndex];
};

export const randomNegativeFilteredIndustry = (func: (industry: Industry) => boolean): Industry => {
  return filterRandomIndustry((industry: Industry) => {
    return !func(industry);
  });
};

export const randomHomeBasedIndustry = (excludedIndustryIds?: string[]): string => {
  const filter = (it: Industry): boolean => {
    const filterCriteria = !!it.industryOnboardingQuestions.canBeHomeBased && it.isEnabled;
    return excludedIndustryIds
      ? filterCriteria && !excludedIndustryIds.includes(it.id)
      : filterCriteria;
  };
  return filterRandomIndustry(filter).id;
};

export const randomNonHomeBasedIndustry = (excludedIndustryIds?: string[]): string => {
  const filter = (it: Industry): boolean => {
    const filterCriteria =
      !it.industryOnboardingQuestions.canBeHomeBased && it.canHavePermanentLocation && it.isEnabled;
    return excludedIndustryIds
      ? filterCriteria && !excludedIndustryIds.includes(it.id)
      : filterCriteria;
  };
  return filterRandomIndustry(filter).id;
};

export const generateBusinessPersona = (): Exclude<BusinessPersona, undefined> => {
  const all = ["STARTING", "OWNING", "FOREIGN"];
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex] as Exclude<BusinessPersona, undefined>;
};

export const randomPublicFilingLegalStructure = (): string => {
  return randomElementFromArray(LegalStructures.filter((x) => x.requiresPublicFiling)).id;
};

export const randomTradeNameLegalStructure = (): string => {
  return randomElementFromArray(LegalStructures.filter((x) => x.hasTradeName)).id;
};

export const publicFilingLegalStructures: string[] = LegalStructures.filter(
  (x) => x.requiresPublicFiling,
).map((it) => it.id);

export const tradeNameLegalStructures: string[] = LegalStructures.filter((x) => x.hasTradeName).map(
  (it) => it.id,
);

export const operatingPhasesDisplayingBusinessStructurePrompt = OperatingPhases.filter(
  (phase) => phase.displayBusinessStructurePrompt,
).map((phase) => phase.id);

export const operatingPhasesNotDisplayingBusinessStructurePrompt = OperatingPhases.filter(
  (phase) => !phase.displayBusinessStructurePrompt,
).map((phase) => phase.id);

export const generateCrtkData = (overrides?: Partial<CrtkData>): CrtkData => ({
  lastUpdatedISO: getCurrentDateISOString(),
  crtkBusinessDetails: {
    businessName: "Test Business",
    addressLine1: "123 Main St",
    city: "Hoboken",
    addressZipCode: "07001",
    ein: "1234567890",
  },
  crtkSearchResult: "NOT_FOUND",
  crtkEntry: {},
  ...overrides,
});

export interface MockIndustry {
  id: string;
  name: string;
  webflowId?: string;
  additionalSearchTerms?: string;
  description: string;
  isEnabled: boolean;
}

export interface WebflowIndustryFieldData {
  name: string;
  slug: string;
  additionalsearchterms?: string;
  description: string;
  industryquerystring: string;
}

export interface WebflowFundingFieldData {
  "program-overview": string;
  eligibility: string;
  benefit: string;
  "learn-more-url": string;
  "certifications-2": string[];
  agency: string;
  "application-close-date": string | null;
  "start-date": string | null;
  name: string;
  slug: string;
  "last-updated": string;
  "funding-status": string;
  "funding-type": string;
  "industry-reference": string[];
}

export interface WebflowSectorFieldData {
  name: string;
  slug: string;
  rank?: number;
}

export interface WebflowLicenseFieldData {
  name: string;
  slug: string;
  website: string;
  "call-to-action-text": string;
  "department-3": string;
  division: string;
  "department-phone-2": string;
  "license-certification-classification": string;
  "form-name": string;
  "primary-industry": string;
  content: string;
  "last-updated": string;
  "license-classification"?: string;
  "summary-description": string;
}

export interface MockLicense {
  id: string;
  webflowId?: string;
  urlSlug: string;
  name: string;
  displayname: string;
  webflowName?: string;
  filename: string;
  callToActionLink?: string;
  callToActionText?: string;
  agencyId?: string;
  agencyAdditionalContext?: string;
  divisionPhone?: string;
  industryId?: string;
  webflowType?: string;
  licenseCertificationClassification: string;
  summaryDescriptionMd?: string;
  contentMd: string;
  syncToWebflow?: boolean | string;
  formName?: string;
  webflowIndustry?: string;
  [key: string]: unknown;
}

export interface MockSector {
  id: string;
  name: string;
}

export const generateMockIndustry = (overrides?: Partial<MockIndustry>): MockIndustry => {
  const id = randomInt();
  const industryId = `industry-${id}`;
  const webflowId = `webflow-${randomInt()}`;
  return {
    id: industryId,
    name: `Industry ${randomInt()}`,
    webflowId,
    additionalSearchTerms: `term-${randomInt()}, term-${randomInt()}, term-${randomInt()}`,
    description: `Industry description ${randomInt()}`,
    isEnabled: true,
    ...overrides,
  };
};

export const generateWebflowIndustry = (
  overrides?: Partial<Omit<WebflowItem<WebflowIndustryFieldData>, "fieldData">> & {
    fieldData?: Partial<WebflowIndustryFieldData>;
  },
): WebflowItem<WebflowIndustryFieldData> => {
  const webflowId = randomInt();
  const industryNum = randomInt();
  const name = `Industry ${industryNum}`;
  const slug = `industry-${industryNum}`;
  return {
    id: overrides?.id ?? `webflow-${webflowId}`,
    fieldData: {
      name,
      slug,
      additionalsearchterms: `term-${randomInt()}, term-${randomInt()}, term-${randomInt()}`,
      description: `Industry description ${randomInt()}`,
      industryquerystring: slug,
      ...overrides?.fieldData,
    },
  };
};

export const generateWebflowFunding = (
  overrides?: Partial<Omit<WebflowItem<WebflowFundingFieldData>, "fieldData">> & {
    fieldData?: Partial<WebflowFundingFieldData>;
  },
): WebflowItem<WebflowFundingFieldData> => {
  const webflowId = randomInt();
  const fundingNum = randomInt();
  const name = `Funding ${fundingNum}`;
  const slug = `funding-${fundingNum}`;
  return {
    id: overrides?.id ?? `webflow-${webflowId}`,
    fieldData: {
      "program-overview": `Program overview ${randomInt()}`,
      eligibility: `Eligibility ${randomInt()}`,
      benefit: `Benefits ${randomInt()}`,
      "learn-more-url": `https://example-${randomInt()}.com`,
      "certifications-2": [],
      agency: `agency-${randomInt()}`,
      "application-close-date": null,
      "start-date": null,
      name,
      slug,
      "last-updated": getCurrentDateISOString(),
      "funding-status": `status-${randomInt()}`,
      "funding-type": `type-${randomInt()}`,
      "industry-reference": [],
      ...overrides?.fieldData,
    },
  };
};

export const generateWebflowSector = (
  overrides?: Partial<Omit<WebflowItem<WebflowSectorFieldData>, "fieldData">> & {
    fieldData?: Partial<WebflowSectorFieldData>;
  },
): WebflowItem<WebflowSectorFieldData> => {
  const sectorId = randomInt();
  const sectorNum = randomInt();
  const name = `Sector ${sectorNum}`;
  const slug = `sector-${sectorNum}`;
  return {
    id: overrides?.id ?? `sector-${sectorId}`,
    fieldData: {
      name,
      slug,
      ...overrides?.fieldData,
    },
  };
};

export const generateMockFunding = (overrides?: Partial<FundingExport>): FundingExport => {
  const fundingNum = randomInt();
  const fundingId = `funding-${fundingNum}`;
  const validAgencies = [
    "njeda",
    "njdol",
    "njdep",
    "njdot",
    "nj-public-utilities",
    "nj-treasury",
    "nj-bac",
    "invest-newark",
  ];
  const validSectors = [
    "clean-energy",
    "technology",
    "life-sciences",
    "advanced-manufacturing",
    "retail",
    "restaurant",
    "home-contractor",
    "cosmetology",
    "e-commerce",
  ];
  return {
    id: fundingId,
    name: `Funding ${randomInt()}`,
    filename: fundingId,
    urlSlug: fundingId,
    callToActionLink: `https://example-${randomInt()}.com`,
    callToActionText: `Apply ${randomInt()}`,
    fundingType: randomFundingType(),
    programPurpose: `Purpose ${randomInt()}`,
    agency: [validAgencies[randomInt() % validAgencies.length]],
    agencyContact: `contact-${randomInt()}@example.com`,
    publishStageArchive: "",
    openDate: `2024-${(randomInt() % 12) + 1}-01`,
    dueDate: `2099-${(randomInt() % 12) + 1}-31`,
    status: randomFundingStatus(),
    programFrequency: randomFundingProgramFrequency(),
    businessStage: randomFundingBusinessStage(),
    employeesRequired: `${randomInt() % 100}`,
    homeBased: randomFundingHomeBased(),
    certifications: [randomFundingCertification()],
    preferenceForOpportunityZone: randomInt() % 2 ? "yes" : "no",
    county: randomCounty(),
    sector: [validSectors[randomInt() % validSectors.length]],
    contentMd: `
## Program Overview
Program overview ${randomInt()}.

>Eligibility</h3>
Eligibility ${randomInt()}.

"Benefits"
Benefits ${randomInt()}.
`,
    ...overrides,
  };
};

export const generateMockLicense = (overrides?: Partial<MockLicense>): MockLicense => {
  const licenseNum = randomInt();
  const licenseId = `license-${licenseNum}`;
  return {
    id: licenseId,
    webflowId: `webflow-${randomInt()}`,
    urlSlug: `license-slug-${randomInt()}`,
    name: `License ${randomInt()}`,
    displayname: `License Display ${randomInt()}`,
    webflowName: `Webflow License ${randomInt()}`,
    filename: `license-${randomInt()}`,
    callToActionLink: `https://example-${randomInt()}.com/apply`,
    callToActionText: `Apply ${randomInt()}`,
    agencyId: `agency-${randomInt()}`,
    agencyAdditionalContext: `Context ${randomInt()}`,
    divisionPhone: `555-${randomInt(4)}`,
    industryId: `industry-${randomInt()}`,
    webflowType: `license-type-${randomInt()}`,
    licenseCertificationClassification: randomElementFromArray(["license", "certification"]),
    summaryDescriptionMd: `Summary ${randomInt()}`,
    contentMd: `## License Content ${randomInt()}\n\nContent ${randomInt()}`,
    ...overrides,
  };
};

export const generateWebflowLicense = (
  overrides?: Partial<Omit<WebflowItem<WebflowLicenseFieldData>, "fieldData">> & {
    fieldData?: Partial<WebflowLicenseFieldData>;
  },
): WebflowItem<WebflowLicenseFieldData> => {
  const webflowId = randomInt();
  const licenseNum = randomInt();
  const name = `License ${licenseNum}`;
  const slug = `license-${licenseNum}`;
  return {
    id: overrides?.id ?? `webflow-${webflowId}`,
    fieldData: {
      name,
      slug,
      website: `https://example-${randomInt()}.com`,
      "call-to-action-text": `Apply ${randomInt()}`,
      "department-3": `Department ${randomInt()}`,
      division: `Division ${randomInt()}`,
      "department-phone-2": `555-${randomInt(4)}`,
      "license-certification-classification": randomElementFromArray(["license", "certification"]),
      "form-name": `form-${randomInt()}`,
      "primary-industry": `Industry ${randomInt()}`,
      content: `Content ${randomInt()}`,
      "last-updated": getCurrentDateISOString(),
      "summary-description": `Summary ${randomInt()}`,
      ...overrides?.fieldData,
    },
  };
};

export const generateMockSector = (overrides?: Partial<MockSector>): MockSector => {
  const sectorNum = randomInt();
  return {
    id: `sector-${sectorNum}`,
    name: `Sector ${randomInt()}`,
    ...overrides,
  };
};
