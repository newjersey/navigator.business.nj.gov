import {
  v119Business,
  v119TaxFiling,
  v119UserData,
} from "@db/migrations/v119_update_structure_to_multiple_businesses";

export interface v120UserData {
  user: v120BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v120Business>;
  currentBusinessId: string;
}

export interface v120Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  profileData: v120ProfileData;
  onboardingFormProgress: v120OnboardingFormProgress;
  taskProgress: Record<string, v120TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v120LicenseData | undefined;
  preferences: v120Preferences;
  taxFilingData: v120TaxFilingData;
  formationData: v120FormationData;
}

export const migrate_v119_to_v120 = (v119Data: v119UserData): v120UserData => {
  return {
    ...v119Data,
    businesses: Object.fromEntries(
      Object.values(v119Data.businesses)
        .map((business) => migrate_v119Business_to_v120Business(business))
        .map((currBusiness) => [currBusiness.id, currBusiness])
    ),
    version: 120,
  };
};

const migrate_v119Business_to_v120Business = (v119BusinessData: v119Business): v120Business => {
  return {
    ...v119BusinessData,
    profileData: {
      ...v119BusinessData.profileData,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      responsibleOwnerName: (v119BusinessData.profileData as any).responsibleOwnerName ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tradeName: (v119BusinessData.profileData as any).tradeName ?? "",
    },
    preferences: {
      ...v119BusinessData.preferences,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      phaseNewlyChanged: (v119BusinessData.preferences as any).phaseNewlyChanged ?? false,
    },
    taxFilingData: {
      ...v119BusinessData.taxFilingData,
      filings: v119BusinessData.taxFilingData.filings.map((filing: v119TaxFiling) => ({
        ...filing,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        calendarEventType: (filing as any).calendarEventType || "TAX-FILING",
      })),
    },
    formationData: {
      ...v119BusinessData.formationData,
      formationFormData: {
        ...v119BusinessData.formationData.formationFormData,
        legalType:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (v119BusinessData.formationData.formationFormData as any).legalType ??
          v119BusinessData.profileData.legalStructureId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        willPracticeLaw: (v119BusinessData.formationData.formationFormData as any).willPracticeLaw,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        businessLocationType: (v119BusinessData.formationData.formationFormData as any).businessLocationType,
        members: v119BusinessData.formationData.formationFormData.members?.map((member) => ({
          ...member,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          businessLocationType: (member as any).businessLocationType,
        })),
        incorporators: v119BusinessData.formationData.formationFormData.incorporators?.map(
          (incorporator) => ({
            ...incorporator,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            businessLocationType: (incorporator as any).businessLocationType,
          })
        ),
      },
    },
  };
};

// ---------------- v120 types ----------------
type v120TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v120OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v120ABExperience = "ExperienceA" | "ExperienceB";

type v120BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v120ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v120ABExperience;
};

interface v120ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v120BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v120ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v120OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v120CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v120IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v120CarServiceType | undefined;
  interstateTransport: boolean;
  isInterstateLogisticsApplicable: boolean | undefined;
  isInterstateMovingApplicable: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  petCareHousing: boolean | undefined;
}

interface v120ProfileData extends v120IndustrySpecificData {
  businessPersona: v120BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v120Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v120ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v120ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string;
  needsNexusDbaName: boolean;
  operatingPhase: v120OperatingPhase;
  isNonprofitOnboardingRadio: boolean;
}

type v120Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v120TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v120TaxFilingErrorFields = "businessName" | "formFailure";

type v120TaxFilingData = {
  state?: v120TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v120TaxFilingErrorFields;
  businessName?: string;
  filings: v120TaxFilingCalendarEvent[];
};

export type v120CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v120TaxFilingCalendarEvent extends v120CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

type v120NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v120LicenseData = {
  nameAndAddress: v120NameAndAddress;
  completedSearch: boolean;
  lastUpdatedISO: string;
  status: v120LicenseStatus;
  items: v120LicenseStatusItem[];
};

type v120Preferences = {
  roadmapOpenSections: v120SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
};

type v120LicenseStatusItem = {
  title: string;
  status: v120CheckoffStatus;
};

type v120CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v120LicenseStatus =
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

const v120SectionNames = ["PLAN", "START"] as const;
type v120SectionType = (typeof v120SectionNames)[number];

type v120ExternalStatus = {
  newsletter?: v120NewsletterResponse;
  userTesting?: v120UserTestingResponse;
};

interface v120NewsletterResponse {
  success?: boolean;
  status: v120NewsletterStatus;
}

interface v120UserTestingResponse {
  success?: boolean;
  status: v120UserTestingStatus;
}

type v120NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v120UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v120NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

interface v120NameAvailabilityResponse {
  status: v120NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

interface v120NameAvailability extends v120NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

interface v120FormationData {
  formationFormData: v120FormationFormData;
  businessNameAvailability: v120NameAvailability | undefined;
  dbaBusinessNameAvailability: v120NameAvailability | undefined;
  formationResponse: v120FormationSubmitResponse | undefined;
  getFilingResponse: v120GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

interface v120FormationFormData extends v120FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v120BusinessSuffix | undefined;
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
  readonly provisions: string[] | undefined;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressMunicipality: v120Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v120FormationMember[] | undefined;
  readonly incorporators: v120FormationIncorporator[] | undefined;
  readonly signers: v120FormationSigner[] | undefined;
  readonly paymentType: v120PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v120StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v120ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
}

type v120ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v120StateObject = {
  shortCode: string;
  name: string;
};

interface v120FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v120StateObject;
  readonly addressMunicipality?: v120Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
  readonly businessLocationType: v120FormationBusinessLocationType | undefined;
}

type v120FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v120SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v120FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v120SignerTitle;
}

interface v120FormationIncorporator extends v120FormationSigner, v120FormationAddress {}

interface v120FormationMember extends v120FormationAddress {
  readonly name: string;
}

type v120PaymentType = "CC" | "ACH" | undefined;

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

const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...foreignCorpBusinessSuffix,
] as const;

type v120BusinessSuffix = (typeof AllBusinessSuffixes)[number];

type v120FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v120FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

type v120FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v120GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};
