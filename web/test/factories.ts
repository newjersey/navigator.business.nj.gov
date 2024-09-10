import { ActiveUser } from "@/lib/auth/AuthContext";
import {
  AllCounties,
  AnytimeActionLicenseReinstatement,
  AnytimeActionLink,
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
} from "@/lib/types/types";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import {
  arrayOfFundingAgencies,
  createEmptyFormationFormData,
  FormationSubmitError,
  FundingAgency,
  generateProfileData,
  getCurrentDateISOString,
  Industry,
  InputFile,
  LegalStructure,
  LegalStructures,
  LicenseTaskID,
  NameAvailability,
  OperatingPhaseId,
  OperatingPhases,
  OwnershipType,
  arrayOfOwnershipTypes as ownershipTypes,
  ProfileData,
  PublicFilingLegalType,
  publicFilingLegalTypes,
  randomInt,
  SectionType,
  StateObject,
  arrayOfStateObjects as states,
} from "@businessnjgovnavigator/shared";
import {
  Address,
  OperatingPhase,
  randomIntFromInterval,
  taskIdLicenseNameMapping,
} from "@businessnjgovnavigator/shared/";
import { FormationData } from "@businessnjgovnavigator/shared/formationData";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";
import { filterRandomIndustry, randomIndustry, randomSector } from "@businessnjgovnavigator/shared/test";

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
  SixDigitNaicsCode?: number
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

export const generateLicenseTask = (overrides: Partial<TaskWithLicenseTaskId>): TaskWithLicenseTaskId => {
  const licenseTaskId = randomElementFromArray(Object.keys(taskIdLicenseNameMapping)) as LicenseTaskID;
  return {
    ...generateTask({}),
    id: licenseTaskId,
    ...overrides,
  };
};

export const generateTaskWithoutLinks = (overrides: Partial<TaskWithoutLinks>): TaskWithoutLinks => {
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

export const generateNameAvailability = (overrides: Partial<NameAvailability>): NameAvailability => {
  return {
    status: "UNAVAILABLE",
    similarNames: [`some-name-${randomInt()}`],
    lastUpdatedTimeStamp: "2023-04-03T20:08:58Z",
    ...overrides,
  };
};

export const generateFormationDbaContent = (
  overrides: Partial<FormationDbaContent>
): FormationDbaContent => ({
  Authorize: generateTaskWithoutLinks({
    contentMd: "start ${beginIndentationSection} middle ${endIndentationSection} after",
  }),
  DbaResolution: generateTaskWithoutLinks({}),
  Formation: generateTaskWithoutLinks({}),
  ...overrides,
});

export const generateSidebarCardContent = (overrides: Partial<SidebarCardContent>): SidebarCardContent => {
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

export const generateStateItem = (): StateObject => {
  return randomElementFromArray(states);
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
  overrides: Partial<FormationSubmitError>
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
    ...overrides,
  };
};

export const generateAnytimeActionTask = (overrides: Partial<AnytimeActionTask>): AnytimeActionTask => {
  return {
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    icon: `some-icon-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    issuingAgency: `some-issuing-agency-${randomInt()}`,
    industryIds: [`some-industry-id-${randomInt()}`],
    sectorIds: [`some-sector-id-${randomInt()}`],
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    applyToAllUsers: false,
    ...overrides,
  };
};

export const generateAnytimeActionLicenseReinstatement = (
  overrides: Partial<AnytimeActionLicenseReinstatement>
): AnytimeActionLicenseReinstatement => {
  return {
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    urlSlug: `some-url-slug-${randomInt()}`,
    icon: `some-icon-${randomInt()}`,
    callToActionLink: `some-cta-link-${randomInt()}`,
    callToActionText: `some-cta-text-${randomInt()}`,
    contentMd: `some-content-${randomInt()}`,
    issuingAgency: `some-issusing-agency-${randomInt()}`,
    summaryDescriptionMd: `some-summary-description-md-${randomInt()}`,
    licenseName: randomElementFromArray(Object.values(taskIdLicenseNameMapping)),
    ...overrides,
  };
};

export const generateAnytimeActionLink = (overrides: Partial<AnytimeActionLink>): AnytimeActionLink => {
  return {
    filename: `some-filename-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    icon: `some-icon-${randomInt()}`,
    externalRoute: `some-external-route-${randomInt()}`,
    industryIds: [`some-industry-id-${randomInt()}`],
    sectorIds: [`some-sector-id-${randomInt()}`],
    applyToAllUsers: false,
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

export const generateOperateReference = (overrides: Partial<OperateReference>): OperateReference => {
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
    previewType: id % 2 ? "renewal" : "expiration",
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

export const generateAddress = (overrides: Partial<Address>): Address => {
  return {
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    addressMunicipality: undefined,
    addressState: undefined,
    addressZipCode: `0${randomIntFromInterval("7001", "8999")}`,
    ...overrides,
  };
};

export const randomPublicFilingLegalType = (): PublicFilingLegalType => {
  return randomElementFromArray(publicFilingLegalTypes as unknown as string[]) as PublicFilingLegalType;
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

export const randomOperatingPhaseId = (): OperatingPhaseId => {
  const randomIndex = Math.floor(Math.random() * OperatingPhases.length);
  return OperatingPhases[randomIndex].id;
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

export const randomHomeBasedIndustry = (): string => {
  const filter = (it: Industry): boolean => {
    return !!it.industryOnboardingQuestions.canBeHomeBased;
  };
  return filterRandomIndustry(filter).id;
};

export const randomNonHomeBasedIndustry = (): string => {
  const filter = (it: Industry): boolean => {
    return !it.industryOnboardingQuestions.canBeHomeBased && it.canHavePermanentLocation;
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
  (x) => x.requiresPublicFiling
).map((it) => it.id);

export const tradeNameLegalStructures: string[] = LegalStructures.filter((x) => x.hasTradeName).map(
  (it) => it.id
);

export const operatingPhasesDisplayingHomeBasedPrompt = OperatingPhases.filter((phase: OperatingPhase) => {
  return phase.displayHomeBasedPrompt;
}).map((phase) => phase.id);

export const operatingPhasesNotDisplayingHomeBasedPrompt = OperatingPhases.filter((phase: OperatingPhase) => {
  return !phase.displayHomeBasedPrompt;
}).map((phase) => phase.id);

export const operatingPhasesNotDisplayingAltHomeBasedBusinessDescription = OperatingPhases.filter(
  (phase: OperatingPhase) => {
    return !phase.displayAltHomeBasedBusinessDescription && phase.displayHomeBasedPrompt;
  }
).map((phase) => phase.id);

export const operatingPhasesDisplayingAltHomeBasedBusinessDescription = OperatingPhases.filter(
  (phase: OperatingPhase) => {
    return phase.displayAltHomeBasedBusinessDescription && phase.displayHomeBasedPrompt;
  }
).map((phase) => phase.id);

export const operatingPhasesDisplayingBusinessStructurePrompt = OperatingPhases.filter(
  (phase) => phase.displayBusinessStructurePrompt
).map((phase) => phase.id);

export const operatingPhasesNotDisplayingBusinessStructurePrompt = OperatingPhases.filter(
  (phase) => !phase.displayBusinessStructurePrompt
).map((phase) => phase.id);
