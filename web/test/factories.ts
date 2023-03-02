import {
  AllCounties,
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
  NaicsCodeObject,
  OperateReference,
  Opportunity,
  Roadmap,
  SidebarCardContent,
  Step,
  Task,
  TaskLink,
  TaskWithoutLinks,
} from "@/lib/types/types";
import { randomElementFromArray } from "@/test/helpers/helpers-utilities";
import {
  AllBusinessSuffixes,
  allFormationLegalTypes,
  arrayOfOwnershipTypes as ownershipTypes,
  arrayOfSectors as sectors,
  arrayOfStateObjects as states,
  BusinessSuffix,
  BusinessSuffixMap,
  BusinessUser,
  createEmptyFormationFormData,
  CURRENT_VERSION,
  defaultDateFormat,
  FormationData,
  FormationLegalType,
  FormationSubmitError,
  FormationSubmitResponse,
  generateFormationFormData,
  generateMunicipality,
  getCurrentDate,
  getCurrentDateFormatted,
  getCurrentDateISOString,
  GetFilingResponse,
  Industries,
  Industry,
  IndustrySpecificData,
  LegalStructure,
  LegalStructures,
  LicenseData,
  LicenseStatusItem,
  LicenseStatusResult,
  MunicipalityDetail,
  NameAndAddress,
  NameAvailability,
  OperatingPhaseId,
  OperatingPhases,
  OwnershipType,
  Preferences,
  ProfileData,
  PublicFilingLegalType,
  publicFilingLegalTypes,
  randomInt,
  SectionType,
  SectorType,
  TaxFiling,
  TaxFilingData,
  TaxFilingLookUpRequest,
  UserData,
} from "@businessnjgovnavigator/shared";
import { BusinessPersona, emptyIndustrySpecificData } from "@businessnjgovnavigator/shared/profileData";

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
    abExperience: randomInt() % 2 === 0 ? "ExperienceA" : "ExperienceB",
    ...overrides,
  };
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  return {
    version: CURRENT_VERSION,
    user: generateUser({}),
    profileData: generateProfileData({}),
    formProgress: "COMPLETED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: generateLicenseData({}),
    preferences: generatePreferences({}),
    taxFilingData: generateTaxFilingData({}),
    formationData: generateFormationData({}),
    lastUpdatedISO: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
    state: undefined,
    businessName: undefined,
    lastUpdatedISO: overrides.state ? getCurrentDateISOString() : undefined,
    registeredISO: ["SUCCESS", "PENDING"].includes(overrides.state ?? "")
      ? getCurrentDateISOString()
      : undefined,
    filings: [generateTaxFiling({})],
    ...overrides,
  };
};

export const generateTaxFiling = (overrides: Partial<TaxFiling>): TaxFiling => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: getCurrentDate().format(defaultDateFormat),
    ...overrides,
  };
};

export const generateIndustrySpecificData = (
  overrides: Partial<IndustrySpecificData>
): IndustrySpecificData => {
  return {
    liquorLicense: !(randomInt() % 2),
    requiresCpa: !(randomInt() % 2),
    homeBasedBusiness: !(randomInt() % 2),
    cannabisLicenseType: randomElementFromArray(["CONDITIONAL", "ANNUAL"]),
    cannabisMicrobusiness: !(randomInt() % 2),
    constructionRenovationPlan: !(randomInt() % 2),
    providesStaffingService: !(randomInt() % 2),
    certifiedInteriorDesigner: !(randomInt() % 2),
    realEstateAppraisalManagement: !(randomInt() % 2),
    carService: randomElementFromArray(["STANDARD", "HIGH_CAPACITY", "BOTH"]),
    interstateTransport: !(randomInt() % 2),
    isChildcareForSixOrMore: !(randomInt() % 2),
    petCareHousing: !(randomInt() % 2),
    willSellPetCareItems: !(randomInt() % 2),
    ...overrides,
  };
};

export const generateUndefinedIndustrySpecificData = () => {
  const result = {} as Record<string, undefined>;

  for (const key of Object.keys(emptyIndustrySpecificData)) {
    result[key] = undefined;
  }
  return result;
};

export const generateProfileData = (
  overrides: Partial<ProfileData>,
  canHavePermanentLocation?: boolean
): ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  const industry = randomIndustry(canHavePermanentLocation);

  return {
    ...generateIndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-responsible-owner-name-${randomInt()}`,
    industryId: industry.id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    dateOfFormation: getCurrentDateFormatted(defaultDateFormat),
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(12).toString(),
    encryptedTaxId: undefined,
    notes: `some-notes-${randomInt()}`,
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    existingEmployees: randomInt(7).toString(),
    taxPin: randomInt(4).toString(),
    sectorId: randomSector().id,
    naicsCode: randomInt(6).toString(),
    foreignBusinessType: undefined,
    foreignBusinessTypeIds: [],
    nexusLocationInNewJersey: undefined,
    nexusDbaName: "",
    needsNexusDbaName: false,
    operatingPhase: "NEEDS_TO_FORM",
    ...overrides,
  };
};

export const getProfileDataForUnfilteredOpportunities = () => {
  return generateProfileData({
    operatingPhase: "UP_AND_RUNNING",
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
    hiddenFundingIds: [],
    hiddenCertificationIds: [],
    visibleSidebarCards: ["welcome"],
    returnToLink: "",
    isCalendarFullView: !(randomInt() % 2),
    isHideableRoadmapOpen: !(randomInt() % 2),
    phaseNewlyChanged: false,
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
    contentMd: `some-content-md-${randomInt()}`,
    postOnboardingQuestion: `some-post-onboarding-${randomInt()}`,
    unlockedBy: [generateTaskLink({})],
    required: Math.random() < 0.5,
    issuingAgency: `some-agency-${randomInt()}`,
    formName: `some-form-${randomInt()}`,
    requiresLocation: Math.random() < 0.5,
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
    contentMd: `some-content-md-${randomInt()}`,
    postOnboardingQuestion: `some-post-onboarding-${randomInt()}`,
    required: Math.random() < 0.5,
    issuingAgency: `some-agency-${randomInt()}`,
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

export const generateTaxIdAndBusinessName = (
  overrides: Partial<TaxFilingLookUpRequest>
): TaxFilingLookUpRequest => {
  return {
    businessName: `some-name-${randomInt()}`,
    taxId: `${randomInt(12)}`,
    encryptedTaxId: "random-encrypted-value",
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
    lastUpdatedISO: getCurrentDateISOString(),
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
    notStartedHeader: `some-not-started-header-${randomInt()}`,
    completedHeader: `some-completed-header-${randomInt()}`,
    imgPath: `some-img-path-${randomInt()}`,
    color: `some-color-${randomInt()}`,
    headerBackgroundColor: `some-header-background-color-${randomInt()}`,
    borderColor: `some-border-color-${randomInt()}`,
    hasCloseButton: !!(randomInt() % 2),
    weight: randomInt() % 2,
    ...overrides,
  };
};

export const generateStateItem = () => {
  return randomElementFromArray(states);
};

export const generateFormationData = (
  overrides: Partial<FormationData>,
  legalStructureId?: FormationLegalType
): FormationData => {
  return {
    formationFormData: generateFormationFormData({}, { legalStructureId }),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    ...overrides,
  };
};

export const generateEmptyFormationData = () => {
  return {
    formationFormData: createEmptyFormationFormData(),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
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
    lastUpdatedISO: getCurrentDateISOString(),
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
    transactionDate: getCurrentDateISOString(),
    confirmationNumber: `some-confirmation-number-${randomInt()}`,
    formationDoc: `some-formation-doc-${randomInt()}`,
    standingDoc: `some-standing-doc-${randomInt()}`,
    certifiedDoc: `some-certified-doc-${randomInt()}`,
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
    contentMd: `some-content-${randomInt()}`,
    descriptionMd: `some-description-${randomInt()}`,
    fundingType: randomFundingType(),
    agency: [randomInt() % 2 ? "NJEDA" : "NJDOL"],
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
    descriptionMd: `some-description-${randomInt()}`,
    agency: [randomInt() % 2 ? "NJEDA" : "NJDOL"],
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
    descriptionMd: `some-description-${randomInt()}`,
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

export const randomPublicFilingLegalType = (): PublicFilingLegalType => {
  return randomElementFromArray(publicFilingLegalTypes as unknown as string[]) as PublicFilingLegalType;
};

export const randomFormationLegalType = (): FormationLegalType => {
  return randomElementFromArray(allFormationLegalTypes as unknown as string[]) as FormationLegalType;
};

export const randomBusinessSuffix = (legalStructureId?: FormationLegalType): BusinessSuffix => {
  const legalSuffix = legalStructureId ? BusinessSuffixMap[legalStructureId] : undefined;
  const suffixes = legalSuffix ?? AllBusinessSuffixes;
  const randomIndex = Math.floor(Math.random() * suffixes.length);
  return suffixes[randomIndex] as BusinessSuffix;
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

export const generateParsedUserAgent = (overrides: Partial<UAParser.IResult>): Partial<UAParser.IResult> => {
  return {
    os: { name: `some-os-name-${randomInt()}`, version: `some-os-version-${randomInt()}` },
    device: {
      vendor: `some-device-vendor-${randomInt()}`,
      model: `some-device-model--${randomInt()}`,
      type: `some-device-type--${randomInt()}`,
    },
    browser: {
      name: `some-browser-name--${randomInt()}`,
      version: `some-browser-version--${randomInt()}`,
      major: `some-browser-major--${randomInt()}`,
    },
    ...overrides,
  };
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

export const randomLegalStructure = (publicFiling?: {
  requiresPublicFiling: boolean | undefined;
}): LegalStructure => {
  const _requiresPublicFiling = publicFiling?.requiresPublicFiling ?? Boolean(randomInt() % 2);
  const LegalPublicFilings = LegalStructures.filter((item) => {
    return item.requiresPublicFiling === _requiresPublicFiling;
  });
  const randomIndex = Math.floor(Math.random() * LegalPublicFilings.length);
  return LegalPublicFilings[randomIndex];
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

export const randomSector = (): SectorType => {
  const randomIndex = Math.floor(Math.random() * sectors.length);
  return sectors[randomIndex];
};

export const randomOperatingPhaseId = (): OperatingPhaseId => {
  const randomIndex = Math.floor(Math.random() * OperatingPhases.length);
  return OperatingPhases[randomIndex].id;
};

export const randomOwnershipType = (): OwnershipType => {
  const randomIndex = Math.floor(Math.random() * ownershipTypes.length);
  return ownershipTypes[randomIndex];
};

export const randomFilteredIndustry = (
  func: (industry: Industry) => boolean,
  { isEnabled = true }
): Industry => {
  const filteredIndustries = Industries.filter((x: Industry) => {
    return func(x) && x.isEnabled == isEnabled;
  });
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};

export const randomNegativeFilteredIndustry = (func: (industry: Industry) => boolean): Industry => {
  return randomFilteredIndustry(
    (industry: Industry) => {
      return !func(industry);
    },
    { isEnabled: true }
  );
};

export const randomIndustry = (canHavePermanentLocation = false): Industry => {
  const filter = (x: Industry) => {
    return x.canHavePermanentLocation === canHavePermanentLocation;
  };
  return randomFilteredIndustry(filter, { isEnabled: true });
};

export const randomHomeBasedIndustry = (): string => {
  const filter = (it: Industry) => {
    return !!it.industryOnboardingQuestions.canBeHomeBased;
  };
  return randomFilteredIndustry(filter, { isEnabled: true }).id;
};

export const randomNonHomeBasedIndustry = (): string => {
  const filter = (it: Industry) => {
    return !it.industryOnboardingQuestions.canBeHomeBased && it.canHavePermanentLocation;
  };
  return randomFilteredIndustry(filter, { isEnabled: true }).id;
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
