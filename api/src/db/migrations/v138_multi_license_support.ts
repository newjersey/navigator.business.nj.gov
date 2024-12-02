import {
  v137Business,
  v137LicenseData,
  v137UserData,
} from "@db/migrations/v137_add_employment_placement_personal_types";
import { randomInt } from "@shared/intHelpers";

export const migrate_v137_to_v138 = (v137Data: v137UserData): v138UserData => {
  return {
    ...v137Data,
    businesses: Object.fromEntries(
      Object.values(v137Data.businesses)
        .map((business: v137Business) => migrate_v137Business_to_v138Business(business))
        .map((currBusiness: v138Business) => [currBusiness.id, currBusiness])
    ),
    version: 138,
  } as v138UserData;
};

export const migrate_v137Business_to_v138Business = (business: v137Business): v138Business => {
  const {
    "license-massage-therapy": licenseMassageTherapy,
    "apply-for-shop-license": applyForShopLicense,
    "appraiser-license": appraiserLicense,
    "health-club-registration": healthClubRegistration,
    "home-health-aide-license": homeHealthAideLicense,
    "pharmacy-license": pharmacyLicense,
    "register-accounting-firm": registerAccountingFirm,
    "register-consumer-affairs": registerConsumerAffairs,
    "ticket-broker-reseller-registration": ticketBrokerResellerRegistration,
    "telemarketing-license": telemarketingLicense,
    ...otherTaskProgressItems
  } = business.taskProgress;

  delete otherTaskProgressItems["architect-license"];
  delete otherTaskProgressItems["hvac-license"];
  delete otherTaskProgressItems["moving-company-license"];
  delete otherTaskProgressItems["public-accountant-license"];
  delete otherTaskProgressItems["landscape-architect-license"];

  if (business.profileData.industryId === "health-care-services-firm-renewal" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "home-health-aide-license": homeHealthAideLicense,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Health Care Services": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "cosmetology" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "apply-for-shop-license": applyForShopLicense,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Cosmetology and Hairstyling-Shop": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "home-contractor" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "register-home-contractor": registerConsumerAffairs,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Home Improvement Contractors-Home Improvement Contractor": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "home-contractor" && !business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "register-home-contractor": registerConsumerAffairs,
      },
    };
  }

  if (business.profileData.industryId === "pharmacy" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "pharmacy-license": pharmacyLicense,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Pharmacy-Pharmacy": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "certified-public-accountant" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "register-accounting-firm": registerAccountingFirm,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Accountancy-Firm Registration": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "massage-therapy" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "license-massage-therapy": licenseMassageTherapy,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Massage and Bodywork Therapy-Massage and Bodywork Employer": getLicenseDetails(
            business.licenseData
          ),
        },
      },
    };
  }

  if (business.profileData.industryId === "moving-company" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "moving-company-license": "NOT_STARTED",
      },
      licenseData: undefined,
    };
  }

  if (business.profileData.industryId === "architecture" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "architect-license": "NOT_STARTED",
      },
      licenseData: undefined,
    };
  }

  if (business.profileData.industryId === "hvac-contractor" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "hvac-license": "NOT_STARTED",
      },
      licenseData: undefined,
    };
  }

  if (business.profileData.industryId === "real-estate-appraisals" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "appraiser-company-register": appraiserLicense,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Real Estate Appraisers-Appraisal Management Company": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "telemarketing" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "telemarketing-license": telemarketingLicense,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          Telemarketers: getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "landscape-architecture" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "landscape-architect-license": "NOT_STARTED",
      },
      licenseData: undefined,
    };
  }

  if (business.profileData.industryId === "health-club" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "health-club-registration": healthClubRegistration,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Health Club Services": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  if (business.profileData.industryId === "retail" && business.licenseData) {
    return {
      ...business,
      taskProgress: {
        ...otherTaskProgressItems,
        "ticket-broker-reseller-registration": ticketBrokerResellerRegistration,
      },
      licenseData: {
        lastUpdatedISO: business.licenseData.lastUpdatedISO,
        licenses: {
          "Ticket Brokers": getLicenseDetails(business.licenseData),
        },
      },
    };
  }

  return {
    ...business,
  } as v138Business;
};

const v138taskIdLicenseNameMapping = {
  "apply-for-shop-license": "Cosmetology and Hairstyling-Shop",
  "appraiser-license": "Real Estate Appraisers-Appraisal Management Company",
  "architect-license": "Architecture-Certificate of Authorization",
  "health-club-registration": "Health Club Services",
  "home-health-aide-license": "Health Care Services",
  "hvac-license": "HVACR-HVACR CE Sponsor",
  "landscape-architect-license": "Landscape Architecture-Certificate of Authorization",
  "license-massage-therapy": "Massage and Bodywork Therapy-Massage and Bodywork Employer",
  "moving-company-license": "Public Movers and Warehousemen-Public Mover and Warehouseman",
  "pharmacy-license": "Pharmacy-Pharmacy",
  "public-accountant-license": "Accountancy-Firm Registration",
  "register-accounting-firm": "Accountancy-Firm Registration",
  "register-consumer-affairs": "Home Improvement Contractors-Home Improvement Contractor",
  "ticket-broker-reseller-registration": "Ticket Brokers",
  "telemarketing-license": "Telemarketers",
} as const;

const getLicenseDetails = (licenseData: v137LicenseData): v138LicenseDetails => ({
  nameAndAddress: licenseData.nameAndAddress,
  licenseStatus: licenseData.status,
  expirationDateISO: licenseData.expirationISO,
  lastUpdatedISO: licenseData.lastUpdatedISO,
  checklistItems: licenseData.items,
  hasError: false,
});

// ---------------- v138 types ----------------
type v138TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v138OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v138ABExperience = "ExperienceA" | "ExperienceB";

export interface v138UserData {
  user: v138BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v138Business>;
  currentBusinessId: string;
}

export interface v138Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v138ProfileData;
  onboardingFormProgress: v138OnboardingFormProgress;
  taskProgress: Record<string, v138TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v138LicenseData | undefined;
  preferences: v138Preferences;
  taxFilingData: v138TaxFilingData;
  formationData: v138FormationData;
}

export interface v138IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v138CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v138CarServiceType | undefined;
  interstateTransport: boolean;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v138ConstructionType;
  residentialConstructionType: v138ResidentialConstructionType;
  employmentPersonnelServiceType: v138EmploymentAndPersonnelServicesType;
  employmentPlacementType: v138EmploymentPlacementType;
}

export interface v138ProfileData extends v138IndustrySpecificData {
  businessPersona: v138BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v138Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v138ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v138ForeignBusinessTypeId[];
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v138OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v138CommunityAffairsAddress;
}

export type v138CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v138Municipality;
};

type v138BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v138ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v138ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
};

interface v138ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v138BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v138OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | undefined;

export type v138CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v138CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v138ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v138ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v138EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v138EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v138ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

type v138Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v138TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v138TaxFilingErrorFields = "businessName" | "formFailure";

type v138TaxFilingData = {
  state?: v138TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v138TaxFilingErrorFields;
  businessName?: string;
  filings: v138TaxFilingCalendarEvent[];
};

export type v138CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v138TaxFilingCalendarEvent extends v138CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v138LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v138LicenseSearchNameAndAddress extends v138LicenseSearchAddress {
  name: string;
}

type v138LicenseDetails = {
  nameAndAddress: v138LicenseSearchNameAndAddress;
  licenseStatus: v138LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v138LicenseStatusItem[];
  hasError?: boolean;
};

type v138LicenseTaskID = keyof typeof v138taskIdLicenseNameMapping;

export type v138LicenseName = (typeof v138taskIdLicenseNameMapping)[v138LicenseTaskID];

type v138Licenses = Partial<Record<v138LicenseName, v138LicenseDetails>>;

type v138LicenseData = {
  lastUpdatedISO: string;
  licenses?: v138Licenses;
};

type v138Preferences = {
  roadmapOpenSections: v138SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v138LicenseStatusItem = {
  title: string;
  status: v138CheckoffStatus;
};

type v138CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v138LicenseStatus =
  | "ACTIVE"
  | "PENDING"
  | "UNKNOWN"
  | "EXPIRED"
  | "BARRED"
  | "OUT_OF_BUSINESS"
  | "REINSTATEMENT_PENDING"
  | "CLOSED"
  | "DELETED"
  | "DENIED"
  | "VOLUNTARY_SURRENDER"
  | "WITHDRAWN";

const v138SectionNames = ["PLAN", "START"] as const;
type v138SectionType = (typeof v138SectionNames)[number];

type v138ExternalStatus = {
  newsletter?: v138NewsletterResponse;
  userTesting?: v138UserTestingResponse;
};

interface v138NewsletterResponse {
  success?: boolean;
  status: v138NewsletterStatus;
}

interface v138UserTestingResponse {
  success?: boolean;
  status: v138UserTestingStatus;
}

type v138NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v138UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v138NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v138NameAvailabilityResponse {
  status: v138NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v138NameAvailability extends v138NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v138FormationData {
  formationFormData: v138FormationFormData;
  businessNameAvailability: v138NameAvailability | undefined;
  dbaBusinessNameAvailability: v138NameAvailability | undefined;
  formationResponse: v138FormationSubmitResponse | undefined;
  getFilingResponse: v138GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v138InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;

interface v138FormationFormData extends v138FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v138BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string; // YYYY-MM-DD
  readonly businessPurpose: string;
  readonly withdrawals: string;
  readonly combinedInvestment: string;
  readonly dissolution: string;
  readonly canCreateLimitedPartner: boolean | undefined;
  readonly createLimitedPartnerTerms: string;
  readonly canGetDistribution: boolean | undefined;
  readonly getDistributionTerms: string;
  readonly canMakeDistribution: boolean | undefined;
  readonly makeDistributionTerms: string;
  readonly hasNonprofitBoardMembers: boolean | undefined;
  readonly nonprofitBoardMemberQualificationsSpecified: v138InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v138InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v138InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v138InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v138FormationMember[] | undefined;
  readonly incorporators: v138FormationIncorporator[] | undefined;
  readonly signers: v138FormationSigner[] | undefined;
  readonly paymentType: v138PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v138StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v138ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
}

type v138ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v138StateObject = {
  shortCode: string;
  name: string;
};

interface v138FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v138StateObject;
  readonly addressMunicipality?: v138Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v138FormationBusinessLocationType | undefined;
}

type v138FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v138SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v138FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v138SignerTitle;
}

interface v138FormationIncorporator extends v138FormationSigner, v138FormationAddress {}

interface v138FormationMember extends v138FormationAddress {
  readonly name: string;
}

type v138PaymentType = "CC" | "ACH" | undefined;

const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY",
] as const;

const llpBusinessSuffix = [
  "Limited Liability Partnership",
  "LLP",
  "L.L.P.",
  "Registered Limited Liability Partnership",
  "RLLP",
  "R.L.L.P.",
] as const;

export const lpBusinessSuffix = ["LIMITED PARTNERSHIP", "LP", "L.P."] as const;

const corpBusinessSuffix = [
  "Corporation",
  "Incorporated",
  "Company",
  "LTD",
  "CO",
  "CO.",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const;

export const nonprofitBusinessSuffix = [
  "A NJ NONPROFIT CORPORATION",
  "CORPORATION",
  "INCORPORATED",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const;

const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

export const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...corpBusinessSuffix,
  ...foreignCorpBusinessSuffix,
  ...nonprofitBusinessSuffix,
] as const;

type v138BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v138FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v138FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v138FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v138GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

// ---------------- v138 generators ----------------

export const generatev138UserData = (overrides: Partial<v138UserData>): v138UserData => {
  return {
    user: generatev138BusinessUser({}),
    version: 138,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: -1,
    businesses: {},
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev138BusinessUser = (overrides: Partial<v138BusinessUser>): v138BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: false,
    userTesting: false,
    externalStatus: {},
    myNJUserKey: undefined,
    intercomHash: undefined,
    abExperience: "ExperienceA",
    accountCreationSource: `some-source-${randomInt()}`,
    contactSharingWithAccountCreationPartner: false,
    ...overrides,
  };
};

export const generatev138Business = (overrides: Partial<v138Business>): v138Business => {
  const profileData = generatev138ProfileData({});
  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    profileData: profileData,
    preferences: generatev138Preferences({}),
    formationData: generatev138FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    taxFilingData: generatev138TaxFilingData({}),
    ...overrides,
  };
};

export const generatev138ProfileData = (overrides: Partial<v138ProfileData>): v138ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev138IndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "limited-liability-partnership",
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
    encryptedTaxId: `some-encrypted-value`,
    notes: `some-notes-${randomInt()}`,
    existingEmployees: randomInt(7).toString(),
    naicsCode: randomInt(6).toString(),
    isNonprofitOnboardingRadio: false,
    nexusDbaName: "undefined",
    needsNexusDbaName: true,
    operatingPhase: "NEEDS_TO_FORM",
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    taxPin: randomInt(4).toString(),
    sectorId: undefined,
    foreignBusinessTypeIds: [],
    municipality: {
      name: `some-name-${randomInt()}`,
      displayName: `some-display-name-${randomInt()}`,
      county: `some-county-${randomInt()}`,
      id: `some-id-${randomInt()}`,
    },
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    elevatorOwningBusiness: undefined,
    nonEssentialRadioAnswers: {},
    ...overrides,
  };
};

export const generatev138IndustrySpecificData = (
  overrides: Partial<v138IndustrySpecificData>
): v138IndustrySpecificData => {
  return {
    liquorLicense: false,
    requiresCpa: false,
    homeBasedBusiness: false,
    cannabisLicenseType: undefined,
    cannabisMicrobusiness: undefined,
    constructionRenovationPlan: undefined,
    providesStaffingService: false,
    certifiedInteriorDesigner: false,
    realEstateAppraisalManagement: false,
    carService: undefined,
    interstateTransport: false,
    isChildcareForSixOrMore: undefined,
    willSellPetCareItems: undefined,
    petCareHousing: undefined,
    interstateLogistics: undefined,
    interstateMoving: undefined,
    constructionType: undefined,
    residentialConstructionType: undefined,
    employmentPersonnelServiceType: undefined,
    employmentPlacementType: undefined,

    ...overrides,
  };
};

export const generatev138Preferences = (overrides: Partial<v138Preferences>): v138Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    hiddenCertificationIds: [],
    hiddenFundingIds: [],
    visibleSidebarCards: ["other-card"],
    returnToLink: "",
    isCalendarFullView: true,
    isHideableRoadmapOpen: false,
    phaseNewlyChanged: false,
    ...overrides,
  };
};

export const generatev138FormationData = (
  overrides: Partial<v138FormationData>,
  legalStructureId: string
): v138FormationData => {
  return {
    formationFormData: generatev138FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev138FormationFormData = (
  overrides: Partial<v138FormationFormData>,
  legalStructureId: string
): v138FormationFormData => {
  const isCorp = legalStructureId ? ["s-corporation", "c-corporation"].includes(legalStructureId) : false;

  return <v138FormationFormData>{
    businessName: `some-business-name-${randomInt()}`,
    businessSuffix: "LLC",
    businessTotalStock: isCorp ? randomInt().toString() : "",
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessPurpose: `some-purpose-${randomInt()}`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    addressCity: `some-members-address-city-${randomInt()}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    addressMunicipality: generatev138Municipality({}),
    addressProvince: "",
    withdrawals: `some-withdrawals-text-${randomInt()}`,
    combinedInvestment: `some-combinedInvestment-text-${randomInt()}`,
    dissolution: `some-dissolution-text-${randomInt()}`,
    canCreateLimitedPartner: !!(randomInt() % 2),
    createLimitedPartnerTerms: `some-createLimitedPartnerTerms-text-${randomInt()}`,
    canGetDistribution: !!(randomInt() % 2),
    getDistributionTerms: `some-getDistributionTerms-text-${randomInt()}`,
    canMakeDistribution: !!(randomInt() % 2),
    makeDistributionTerms: `make-getDistributionTerms-text-${randomInt()}`,
    hasNonprofitBoardMembers: true,
    nonprofitBoardMemberQualificationsSpecified: "IN_BYLAWS",
    nonprofitBoardMemberQualificationsTerms: "",
    nonprofitBoardMemberRightsSpecified: "IN_BYLAWS",
    nonprofitBoardMemberRightsTerms: "",
    nonprofitTrusteesMethodSpecified: "IN_BYLAWS",
    nonprofitTrusteesMethodTerms: "",
    nonprofitAssetDistributionSpecified: "IN_BYLAWS",
    nonprofitAssetDistributionTerms: "",
    provisions: [`some-provision-${randomInt()}`],
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `some-agent-office-address-1-${randomInt()}`,
    agentOfficeAddressLine2: `some-agent-office-address-2-${randomInt()}`,
    agentOfficeAddressCity: `some-agent-office-address-city-${randomInt()}`,
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentOfficeAddressMunicipality: generatev138Municipality({}),
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [{ name: "some-name", signature: true, title: "Authorized Representative" }],
    members: legalStructureId === "limited-liability-partnership" ? [] : [generatev138FormationMember({})],
    incorporators: undefined,
    paymentType: randomInt() % 2 ? "ACH" : "CC",
    annualReportNotification: !!(randomInt() % 2),
    corpWatchNotification: !!(randomInt() % 2),
    officialFormationDocument: !!(randomInt() % 2),
    certificateOfStanding: !!(randomInt() % 2),
    certifiedCopyOfFormationDocument: !!(randomInt() % 2),
    contactFirstName: `some-contact-first-name-${randomInt()}`,
    contactLastName: `some-contact-last-name-${randomInt()}`,
    contactPhoneNumber: `some-contact-phone-number-${randomInt()}`,
    foreignStateOfFormation: undefined,
    foreignDateOfFormation: undefined,
    foreignGoodStandingFile: undefined,
    willPracticeLaw: false,
    isVeteranNonprofit: false,
    legalType: "",
    ...overrides,
  };
};

export const generatev138Municipality = (overrides: Partial<v138Municipality>): v138Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev138FormationMember = (overrides: Partial<v138FormationMember>): v138FormationMember => {
  return {
    name: `some-name`,
    addressLine1: `some-members-address-1-${randomInt()}`,
    addressLine2: `some-members-address-2-${randomInt()}`,
    addressCity: `some-members-address-city-${randomInt()}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    businessLocationType: undefined,
    ...overrides,
  };
};

export const generatev138TaxFilingData = (overrides: Partial<v138TaxFilingData>): v138TaxFilingData => {
  return {
    state: undefined,
    businessName: undefined,
    errorField: undefined,
    lastUpdatedISO: undefined,
    registeredISO: undefined,
    filings: [],
    ...overrides,
  };
};
