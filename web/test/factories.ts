import {
  AllCounties,
  Certification,
  County,
  FormationDisplayContent,
  FormationDisplayContentMap,
  Funding,
  FundingBusinessStage,
  FundingHomeBased,
  FundingProgramFrequency,
  FundingStatus,
  FundingType,
  NaicsCodeObject,
  NameAvailability,
  OperateReference,
  Opportunity,
  Roadmap,
  SectionCompletion,
  SectionType,
  SidebarCardContent,
  Step,
  Task,
  TaskLink,
} from "@/lib/types/types";
import { getSectionNames } from "@/lib/utils/helpers";
import {
  AllBusinessSuffixes,
  arrayOfOwnershipTypes as ownershipTypes,
  arrayOfSectors as sectors,
  arrayOfStateObjects as states,
  BusinessSuffix,
  BusinessSuffixMap,
  BusinessUser,
  corpLegalStructures,
  defaultFormationLegalType,
  FormationAddress,
  FormationData,
  FormationFormData,
  FormationLegalType,
  FormationLegalTypes,
  FormationSubmitError,
  FormationSubmitResponse,
  getCurrentDate,
  getCurrentDateFormatted,
  getCurrentDateISOString,
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
  OwnershipType,
  Preferences,
  ProfileData,
  randomInt,
  randomIntFromInterval,
  SectorType,
  TaxFiling,
  TaxFilingData,
  UserData,
} from "@businessnjgovnavigator/shared/";

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
    user: generateUser({}),
    profileData: generateProfileData({}),
    formProgress: "COMPLETED",
    taskProgress: {},
    taskItemChecklist: {},
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
    dueDate: getCurrentDateFormatted("YYYY-MM-DD"),
    ...overrides,
  };
};

export const generateProfileData = (
  overrides: Partial<ProfileData>,
  canHavePermanentLocation?: boolean
): ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  const industry = randomIndustry(canHavePermanentLocation);

  return {
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: industry.id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    liquorLicense: false,
    requiresCpa: false,
    homeBasedBusiness: false,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    dateOfFormation: getCurrentDateFormatted("YYYY-MM-DD"),
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(9).toString(),
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
    nexusDbaName: undefined,
    providesStaffingService: false,
    certifiedInteriorDesigner: industry.industryOnboardingQuestions.isCertifiedInteriorDesignerApplicable,
    realEstateAppraisalManagement: false,
    operatingPhase: "NEEDS_TO_FORM",
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
    lastCheckedStatus: getCurrentDateISOString(),
    ...overrides,
  };
};

export const generateFormationDisplayContent = (
  overrides: Partial<Record<FormationLegalType, Partial<FormationDisplayContent>>>
): FormationDisplayContentMap =>
  FormationLegalTypes.reduce((accumulator, curr) => {
    accumulator[curr] = {
      introParagraph: {
        contentMd: `some-intro-content-${curr}-${randomInt()}`,
      },
      businessNameCheck: {
        contentMd: `some-business-name-check-${curr}--content-${randomInt()}`,
      },
      agentNumberOrManual: {
        contentMd: `some-agent-number-or-manual-${curr}--content-${randomInt()}`,
        radioButtonNumberText: `some-agent-number-or-manual-radio-number-${curr}--text-${randomInt()}`,
        radioButtonManualText: `some-agent-number-or-manual-radio-manual-${curr}--text-${randomInt()}`,
      },
      members: {
        contentMd: `some-members-${curr}--content-${randomInt()}`,
        placeholder: `some-members-${curr}--placeholder-${randomInt()}`,
      },
      signatureHeader: {
        contentMd: `some-signer-${curr}--content- ${randomInt()}`,
        placeholder: `some-signer-${curr}--placeholder- ${randomInt()}`,
      },
      services: {
        contentMd: `some-payment-${curr}--type-content-${randomInt()}`,
      },
      notification: {
        contentMd: `some-${curr}--notification-${randomInt()}`,
      },
      officialFormationDocument: {
        contentMd: `some-official-formation-document-${curr}--content-${randomInt()}`,
        cost: randomInt(),
      },
      certificateOfStanding: {
        contentMd: `some-certificate-of-standing-${curr}--content-${randomInt()}`,
        cost: randomInt(),
        optionalLabel: `some-certificate-of-standing-optional-${curr}--label-${randomInt()}`,
      },
      certifiedCopyOfFormationDocument: {
        contentMd: `some-certified-copy-of-formation-document-${curr}--content-${randomInt()}`,
        cost: randomInt(),
        optionalLabel: `some-certified-copy-of-formation-document-optional-${curr}--label-${randomInt()}`,
      },
      ...overrides[defaultFormationLegalType],
      ...overrides[curr],
    };
    return accumulator;
  }, {} as FormationDisplayContentMap);

export const generateFormationFormData = (
  overrides: Partial<FormationFormData>,
  legalStructureId?: FormationLegalType
): FormationFormData => {
  const isCorp = legalStructureId ? corpLegalStructures.includes(legalStructureId) : false;
  return {
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: randomBusinessSuffix(legalStructureId),
    businessStartDate: getCurrentDate().add(1, "days").format("YYYY-MM-DD"),
    businessAddressCity: generateMunicipality({}),
    businessAddressLine1: `some-address-1-${randomInt()}`,
    businessAddressLine2: `some-address-2-${randomInt()}`,
    businessAddressState: "NJ",
    businessAddressZipCode: randomIntFromInterval("07001", "08999").toString(),
    businessTotalStock: isCorp ? randomInt().toString() ?? "" : "",
    businessPurpose: `some-purpose-${randomInt()}`,
    provisions: [`some-provision-${randomInt()}`],
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}@gmail.com`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: randomIntFromInterval("07001", "08999").toString(),
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    members: [generateFormationAddress({})],
    signers: [generateFormationAddress({ signature: true }), generateFormationAddress({ signature: true })],
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    withdrawals: `some-withdrawals-text-${randomInt()}`,
    dissolution: `some-dissolution-text-${randomInt()}`,
    combinedInvestment: `some-combinedInvestment-text-${randomInt()}`,
    canCreateLimitedPartner: !!(randomInt() % 2),
    createLimitedPartnerTerms: `some-createLimitedPartnerTerms-text-${randomInt()}`,
    canGetDistribution: !!(randomInt() % 2),
    getDistributionTerms: `some-getDistributionTerms-text-${randomInt()}`,
    canMakeDistribution: !!(randomInt() % 2),
    makeDistributionTerms: `some-makeDistributionTerms-text-${randomInt()}`,
    ...overrides,
  };
};

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

const generateZipCode = () => {
  const zip = randomIntFromInterval("1", "99999").toString();
  return "0".repeat(5 - zip.length) + zip;
};

const generateStateItem = () => states[randomIntFromInterval("0", (states.length - 1).toString())];

export const generateStateInput = () => generateStateItem()[randomInt() % 2 ? "shortCode" : "name"];

export const generateFormationAddress = (overrides: Partial<FormationAddress>): FormationAddress => ({
  name: `some-members-name-${randomInt()}`,
  addressLine1: `some-members-address-1-${randomInt()}`,
  addressLine2: `some-members-address-2-${randomInt()}`,
  addressCity: `some-members-address-city-${randomInt()}`,
  addressState: generateStateItem().shortCode,
  addressZipCode: generateZipCode(),
  signature: false,
  ...overrides,
});

export const generateFormationData = (
  overrides: Partial<FormationData>,
  legalStructureId?: FormationLegalType
): FormationData => {
  return {
    formationFormData: generateFormationFormData({}, legalStructureId),
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
    transactionDate: getCurrentDateISOString(),
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
    mwvb: `some-mwvb-${randomInt()}`,
    preferenceForOpportunityZone: null,
    county: [randomCounty()],
    sector: [randomSector().id],
    programPurpose: "some-purpose-${randomInt()}",
    agencyContact: "some-contact-${randomInt()}",
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

export const randomFormationLegalType = (): FormationLegalType => {
  const randomIndex = Math.floor(Math.random() * FormationLegalTypes.length);
  return FormationLegalTypes[randomIndex] as FormationLegalType;
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

export const randomLegalStructure = (requiresPublicFiling?: boolean): LegalStructure => {
  const _requiresPublicFiling = requiresPublicFiling ?? Boolean(randomInt() % 2);
  const LegalPublicFilings = LegalStructures.filter(
    (item) => item.requiresPublicFiling === _requiresPublicFiling
  );
  const randomIndex = Math.floor(Math.random() * LegalPublicFilings.length);
  return LegalPublicFilings[randomIndex];
};

export const randomSector = (): SectorType => {
  const randomIndex = Math.floor(Math.random() * sectors.length);
  return sectors[randomIndex];
};

export const randomOwnershipType = (): OwnershipType => {
  const randomIndex = Math.floor(Math.random() * ownershipTypes.length);
  return ownershipTypes[randomIndex];
};

export const randomIndustry = (canHavePermanentLocation = false): Industry => {
  const filteredIndustries = Industries.filter(
    (x: Industry) => x.canHavePermanentLocation === canHavePermanentLocation && x.isEnabled
  );
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};
