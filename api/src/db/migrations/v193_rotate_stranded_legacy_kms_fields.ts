import type {
  v192Business,
  v192BusinessUser,
  v192UserData,
} from "@db/migrations/v192_fix_confirmation_email_sent_typo";
import { randomInt } from "@shared/intHelpers";
import { type MigrationClients } from "@db/migrations/types";

const rotateField = async (
  fieldName: string,
  encryptedValue: string | undefined,
  clients: MigrationClients,
): Promise<string | undefined> => {
  if (!encryptedValue) {
    return encryptedValue;
  }

  let plaintext: string;
  try {
    plaintext = await clients.cryptoClient.decryptValue(encryptedValue);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Migration v193 failed to decrypt ${fieldName}: ${message}`, {
      cause: error,
    });
  }

  try {
    return await clients.cryptoClient.encryptValue(plaintext);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Migration v193 failed to encrypt ${fieldName}: ${message}`, {
      cause: error,
    });
  }
};

export const migrate_v192_to_v193 = async (
  userData: v192UserData,
  clients?: MigrationClients,
): Promise<v193UserData> => {
  if (!clients) {
    throw new Error("Migration v193 requires migration clients");
  }

  const migratedBusinesses = await Promise.all(
    Object.values(userData.businesses).map(async (business) => {
      const migratedBusiness = await migrate_v192Business_to_v193Business(business, clients);

      return [migratedBusiness.id, migratedBusiness] as const;
    }),
  );

  return {
    ...userData,
    user: migrate_v192BusinessUser_to_v193BusinessUser(userData.user),
    businesses: Object.fromEntries(migratedBusinesses),
    version: 193,
  };
};

const migrate_v192BusinessUser_to_v193BusinessUser = (
  user: v192BusinessUser,
): v193BusinessUser => ({
  ...user,
});

type LegacyTaxClearanceCertificateData = {
  encryptedTaxId?: string;
  encryptedTaxPin?: string;
};

const migrate_v192Business_to_v193Business = async (
  business: v192Business,
  clients: MigrationClients,
): Promise<v193Business> => {
  const encryptedTaxId = await rotateField(
    "profileData.encryptedTaxId",
    business.profileData.encryptedTaxId,
    clients,
  );

  const cigaretteEncryptedTaxId = await rotateField(
    "cigaretteLicenseData.encryptedTaxId",
    business.cigaretteLicenseData?.encryptedTaxId,
    clients,
  );

  const encryptedTaxPin = await rotateField(
    "profileData.encryptedTaxPin",
    business.profileData.encryptedTaxPin,
    clients,
  );

  const encryptedDeptOfLaborEin = await rotateField(
    "profileData.deptOfLaborEin",
    business.profileData.deptOfLaborEin,
    clients,
  );

  // These fields exist in stored records but were omitted from the v191/v192 type tree.
  const legacyTaxClearance = business.taxClearanceCertificateData as
    | (typeof business.taxClearanceCertificateData & LegacyTaxClearanceCertificateData)
    | undefined;
  const taxClearanceEncryptedTaxId = await rotateField(
    "taxClearanceCertificateData.encryptedTaxId",
    legacyTaxClearance?.encryptedTaxId,
    clients,
  );
  const taxClearanceEncryptedTaxPin = await rotateField(
    "taxClearanceCertificateData.encryptedTaxPin",
    legacyTaxClearance?.encryptedTaxPin,
    clients,
  );

  return {
    ...business,
    version: 193,
    profileData: {
      ...business.profileData,
      encryptedTaxId,
      encryptedTaxPin,
      deptOfLaborEin: encryptedDeptOfLaborEin ?? "",
    },
    taxClearanceCertificateData: business.taxClearanceCertificateData
      ? {
          ...business.taxClearanceCertificateData,
          encryptedTaxId: taxClearanceEncryptedTaxId,
          encryptedTaxPin: taxClearanceEncryptedTaxPin,
        }
      : business.taxClearanceCertificateData,
    cigaretteLicenseData: business.cigaretteLicenseData
      ? {
          ...business.cigaretteLicenseData,
          encryptedTaxId: cigaretteEncryptedTaxId,
        }
      : business.cigaretteLicenseData,
  };
};

export interface v193IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean | undefined;
  homeBasedBusiness?: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v193CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v193CarServiceType | undefined;
  interstateTransport: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v193ConstructionType;
  residentialConstructionType: v193ResidentialConstructionType;
  employmentPersonnelServiceType: v193EmploymentAndPersonnelServicesType;
  employmentPlacementType: v193EmploymentPlacementType;
  propertyLeaseType: v193PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v193PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v193 types ----------------
type v193TaskProgress = "TO_DO" | "COMPLETED";
type v193OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v193ABExperience = "ExperienceA" | "ExperienceB";

export interface v193UserData {
  user: v193BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v193Business>;
  currentBusinessId: string;
}

export interface v193Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v193ProfileData;
  onboardingFormProgress: v193OnboardingFormProgress;
  taskProgress: Record<string, v193TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v193LicenseData | undefined;
  preferences: v193Preferences;
  taxFilingData: v193TaxFilingData;
  formationData: v193FormationData;
  environmentData: v193EnvironmentData | undefined;
  xrayRegistrationData: v193XrayData | undefined;
  crtkData: v193CrtkData | undefined;
  roadmapTaskData: v193RoadmapTaskData;
  taxClearanceCertificateData: v193TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v193CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v193RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v193ProfileData extends v193IndustrySpecificData {
  businessPersona: v193BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v193Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v193ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v193ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v193OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v193CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v193CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v193Municipality;
};

export type v193BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v193ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v193ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

export interface v193ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v193BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v193OperatingPhase =
  | "GUEST_MODE"
  | "GUEST_MODE_WITH_BUSINESS_STRUCTURE"
  | "GUEST_MODE_OWNING"
  | "NEEDS_TO_FORM"
  | "NEEDS_BUSINESS_STRUCTURE"
  | "FORMED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | "REMOTE_SELLER_WORKER"
  | "DOMESTIC_EMPLOYER"
  | undefined;

export type v193CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v193CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v193ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v193ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v193EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v193EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v193ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export type v193Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v193TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v193TaxFilingErrorFields = "businessName" | "formFailure";

export type v193TaxFilingData = {
  state?: v193TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v193TaxFilingErrorFields;
  businessName?: string;
  filings: v193TaxFilingCalendarEvent[];
};

export type v193CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v193TaxFilingCalendarEvent extends v193CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v193LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v193LicenseSearchNameAndAddress extends v193LicenseSearchAddress {
  name: string;
}

export type v193LicenseDetails = {
  nameAndAddress: v193LicenseSearchNameAndAddress;
  licenseStatus: v193LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v193LicenseStatusItem[];
};

const v193taskIdLicenseNameMapping = {
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

type v193LicenseTaskID = keyof typeof v193taskIdLicenseNameMapping;

export type v193LicenseName = (typeof v193taskIdLicenseNameMapping)[v193LicenseTaskID];

type v193Licenses = Partial<Record<v193LicenseName, v193LicenseDetails>>;

export type v193LicenseData = {
  lastUpdatedISO: string;
  licenses?: v193Licenses;
};

export type v193Preferences = {
  roadmapOpenSections: v193SectionType[];
  roadmapOpenSteps: number[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
  isNonProfitFromFunding?: boolean;
};

export type v193LicenseStatusItem = {
  title: string;
  status: v193CheckoffStatus;
};

type v193CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v193LicenseStatus =
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

const v193LicenseStatuses: v193LicenseStatus[] = [
  "ACTIVE",
  "PENDING",
  "UNKNOWN",
  "EXPIRED",
  "BARRED",
  "OUT_OF_BUSINESS",
  "REINSTATEMENT_PENDING",
  "CLOSED",
  "DELETED",
  "DENIED",
  "VOLUNTARY_SURRENDER",
  "WITHDRAWN",
];

const v193SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type v193SectionType = (typeof v193SectionNames)[number];

export type v193ExternalStatus = {
  newsletter?: v193NewsletterResponse;
  userTesting?: v193UserTestingResponse;
};

export interface v193NewsletterResponse {
  success?: boolean;
  status: v193NewsletterStatus;
}

export interface v193UserTestingResponse {
  success?: boolean;
  status: v193UserTestingStatus;
}

type v193NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "CONNECTION_ERROR",
  "RESPONSE_ERROR",
] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v193UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v193NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface v193NameAvailabilityResponse {
  status: v193NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface v193NameAvailability extends v193NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v193FormationData {
  formationFormData: v193FormationFormData;
  businessNameAvailability: v193NameAvailability | undefined;
  dbaBusinessNameAvailability: v193NameAvailability | undefined;
  formationResponse: v193FormationSubmitResponse | undefined;
  getFilingResponse: v193GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v193InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v193HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v193FormationFormData extends v193FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean | undefined;
  readonly businessSuffix: v193BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v193InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v193InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v193InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v193InFormInBylaws;
  readonly nonprofitAssetDistributionTerms: string;
  readonly additionalProvisions: string[] | undefined;
  readonly agentType: "MYSELF" | "AUTHORIZED_REP" | "PROFESSIONAL_SERVICE";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v193FormationMember[] | undefined;
  readonly incorporators: v193FormationIncorporator[] | undefined;
  readonly signers: v193FormationSigner[] | undefined;
  readonly paymentType: v193PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v193StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v193ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean | undefined;
  readonly howToProceed: v193HowToProceedOptions;
}

export type v193ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

export type v193StateObject = {
  shortCode: string;
  name: string;
};

export interface v193FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v193StateObject;
  readonly addressMunicipality?: v193Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry?: string;
  readonly businessLocationType: v193FormationBusinessLocationType | undefined;
}

type v193FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v193SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

export interface v193FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v193SignerTitle;
}

export interface v193FormationIncorporator extends v193FormationSigner, v193FormationAddress {}

export interface v193FormationMember extends v193FormationAddress {
  readonly name: string;
}

type v193PaymentType = "CC" | "ACH" | undefined;

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

type v193BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export type v193FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v193FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type v193FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type v193GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v193EnvironmentData {
  questionnaireData?: v193QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v193QuestionnaireData = {
  air: v193AirData;
  land: v193LandData;
  waste: v193WasteData;
  drinkingWater: v193DrinkingWaterData;
  wasteWater: v193WasteWaterData;
};

export type v193AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v193AirData = Record<v193AirFieldIds, boolean>;

export type v193LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v193LandData = Record<v193LandFieldIds, boolean>;

export type v193WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v193WasteData = Record<v193WasteFieldIds, boolean>;

export type v193DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v193DrinkingWaterData = Record<v193DrinkingWaterFieldIds, boolean>;

export type v193WasteWaterFieldIds =
  | "sanitaryWaste"
  | "industrialWaste"
  | "localSewage"
  | "septicSystem"
  | "streamsRiversOrLakes"
  | "needsTreatment"
  | "planningConstruction"
  | "stormWaterDischarge"
  | "takeoverIndustrialStormWaterPermit"
  | "noWasteWater";

export type v193WasteWaterData = Record<v193WasteWaterFieldIds, boolean>;

export type v193CrtkBusinessDetails = {
  businessName: string;
  addressLine1: string;
  city: string;
  addressZipCode: string;
  ein?: string | undefined;
};

export type v193CrtkSearchResult = "FOUND" | "NOT_FOUND";

export interface v193CrtkEntry {
  businessName?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  ein?: string;
  facilityId?: string;
  sicCode?: string;
  naicsCode?: string;
  naicsDescription?: string;
  businessActivity?: string;
  type?: string;
  facilityStatus?: string;
  eligibility?: string;
  status?: string;
  receivedDate?: string;
}

export interface v193CrtkEmailMetadata {
  username: string;
  email: string;
  businessName: string;
  businessStatus: string;
  businessAddress: string;
  industry: string;
  ein: string;
  naicsCode: string;
  businessActivities: string;
  materialOrProducts: string;
}

export type v193CrtkData = {
  lastUpdatedISO: string;
  crtkBusinessDetails?: v193CrtkBusinessDetails;
  crtkSearchResult: v193CrtkSearchResult;
  crtkEntry: v193CrtkEntry;
  crtkEmailSent?: boolean;
};

export type v193TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v193StateObject | undefined;
  addressZipCode?: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v193CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v193StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v193StateObject;
  mailingAddressZipCode?: string;
  contactName?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  salesInfoStartDate?: string;
  salesInfoSupplier?: string[];
  signerName?: string;
  signerRelationship?: string;
  signature?: boolean;
  lastUpdatedISO?: string;
  paymentInfo?: v193CigaretteLicensePaymentInfo;
};

export type v193CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailSent?: boolean;
};

export type v193XrayData = {
  facilityDetails?: v193FacilityDetails;
  machines?: v193MachineDetails[];
  status?: v193XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v193FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v193MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v193XrayRegistrationStatusResponse = {
  machines: v193MachineDetails[];
  status: v193XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v193XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v193 generators ----------------

export const generatev193UserData = (overrides: Partial<v193UserData>): v193UserData => {
  return {
    user: generatev193BusinessUser({}),
    version: 193,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev193Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev193BusinessUser = (
  overrides: Partial<v193BusinessUser>,
): v193BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: true,
    userTesting: true,
    receiveUpdatesAndReminders: true,
    externalStatus: {
      userTesting: {
        success: true,
        status: "SUCCESS",
      },
    },
    myNJUserKey: undefined,
    intercomHash: undefined,
    abExperience: "ExperienceA",
    accountCreationSource: `some-source-${randomInt()}`,
    contactSharingWithAccountCreationPartner: true,
    phoneNumber: undefined,
    ...overrides,
  };
};

export const generatev193RoadmapTaskData = (
  overrides: Partial<v193RoadmapTaskData>,
): v193RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev193Business = (overrides: Partial<v193Business>): v193Business => {
  const profileData = generatev193ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev193Preferences({}),
    formationData: generatev193FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev193TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev193CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev193RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev193TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    crtkData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 193,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev193ProfileData = (overrides: Partial<v193ProfileData>): v193ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev193IndustrySpecificData({}),
    businessPersona: persona,
    businessName: `some-business-name-${randomInt()}`,
    industryId: "restaurant",
    legalStructureId: "limited-liability-partnership",
    dateOfFormation: undefined,
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt() % 2 ? randomInt(9).toString() : randomInt(12).toString(),
    hashedTaxId: `some-hashed-tax-id`,
    encryptedTaxId: `some-encrypted-tax-id`,
    notes: `some-notes-${randomInt()}`,
    existingEmployees: randomInt(7).toString(),
    naicsCode: randomInt(6).toString(),
    nexusDbaName: "undefined",
    operatingPhase: "NEEDS_TO_FORM",
    ownershipTypeIds: [],
    documents: {
      certifiedDoc: `${id}/certifiedDoc-${randomInt()}.pdf`,
      formationDoc: `${id}/formationDoc-${randomInt()}.pdf`,
      standingDoc: `${id}/standingDoc-${randomInt()}.pdf`,
    },
    taxPin: randomInt(4).toString(),
    encryptedTaxPin: `some-encrypted-tax-pin`,
    sectorId: undefined,
    foreignBusinessTypeIds: [],
    municipality: undefined,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    elevatorOwningBusiness: undefined,
    nonEssentialRadioAnswers: {},
    plannedRenovationQuestion: undefined,
    communityAffairsAddress: undefined,
    raffleBingoGames: undefined,
    businessOpenMoreThanTwoYears: undefined,
    employerAccessRegistration: undefined,
    deptOfLaborEin: `some-dept-of-labor-ein-${randomInt()}`,
    ...overrides,
  };
};

export const generatev193IndustrySpecificData = (
  overrides: Partial<v193IndustrySpecificData>,
): v193IndustrySpecificData => {
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
    propertyLeaseType: undefined,
    hasThreeOrMoreRentalUnits: undefined,
    publicWorksContractor: undefined,
    ...overrides,
  };
};

export const generatev193Preferences = (overrides: Partial<v193Preferences>): v193Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [],
    visibleSidebarCards: [],
    returnToLink: "",
    isCalendarFullView: true,
    isHideableRoadmapOpen: false,
    phaseNewlyChanged: false,
    isNonProfitFromFunding: undefined,
    ...overrides,
  };
};

export const generatev193FormationData = (
  overrides: Partial<v193FormationData>,
  legalStructureId: string,
): v193FormationData => {
  return {
    formationFormData: generatev193FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev193FormationFormData = (
  overrides: Partial<v193FormationFormData>,
  legalStructureId: string,
): v193FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v193FormationFormData>{
    businessName: `some-business-name-${randomInt()}`,
    businessNameConfirmation: true,
    businessSuffix: "LLC",
    businessTotalStock: isCorp ? randomInt().toString() : "",
    businessStartDate: new Date(Date.now()).toISOString().split("T")[0],
    businessPurpose: `some-purpose-${randomInt()}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    addressMunicipality: generatev193Municipality({}),
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
    provisions: [],
    agentType: "MYSELF",
    agentNumberOrManual: randomInt() % 2 ? "NUMBER" : "MANUAL_ENTRY",
    agentNumber: `some-agent-number-${randomInt()}`,
    agentName: `some-agent-name-${randomInt()}`,
    agentEmail: `some-agent-email-${randomInt()}`,
    agentOfficeAddressLine1: `addr1-${randomInt(3)}`,
    agentOfficeAddressLine2: `addr2-${randomInt(3)}`,
    agentOfficeAddressCity: `city-${randomInt(3)}`,
    agentOfficeAddressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    agentUseAccountInfo: !!(randomInt() % 2),
    agentUseBusinessAddress: !!(randomInt() % 2),
    signers: [],
    members:
      legalStructureId === "limited-liability-partnership" ? [] : [generatev193FormationMember({})],
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
    additionalProvisions: undefined,
    businessLocationType: undefined,
    checkNameReservation: false,
    howToProceed: "DIFFERENT_NAME",
    ...overrides,
  };
};

export const generatev193Municipality = (
  overrides: Partial<v193Municipality>,
): v193Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev193FormationMember = (
  overrides: Partial<v193FormationMember>,
): v193FormationMember => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: { shortCode: "123", name: "new-jersey" },
    addressZipCode: `some-agent-office-zipcode-${randomInt()}`,
    addressCountry: `some-county`,
    businessLocationType: undefined,
    ...overrides,
  };
};

export const generatev193TaxFilingData = (
  overrides: Partial<v193TaxFilingData>,
): v193TaxFilingData => {
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

export const generatev193LicenseDetails = (
  overrides: Partial<v193LicenseDetails>,
): v193LicenseDetails => {
  return {
    nameAndAddress: generatev193LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv193LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev193LicenseStatusItem()],
    ...overrides,
  };
};

const generatev193LicenseSearchNameAndAddress = (
  overrides: Partial<v193LicenseSearchNameAndAddress>,
): v193LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev193LicenseStatusItem = (): v193LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv193LicenseStatus = (): v193LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v193LicenseStatuses.length);
  return v193LicenseStatuses[randomIndex];
};

export const generatev193TaxClearanceCertificateData = (
  overrides: Partial<v193TaxClearanceCertificateData>,
): v193TaxClearanceCertificateData => {
  return {
    requestingAgencyId: "",
    businessName: `some-business-name-${randomInt()}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    taxId: `${randomInt(12)}`,
    encryptedTaxId: `some-encrypted-tax-id-${randomInt()}`,
    taxPin: randomInt(4).toString(),
    encryptedTaxPin: `some-encrypted-tax-pin-${randomInt()}`,
    hasPreviouslyReceivedCertificate: undefined,
    lastUpdatedISO: "",
    ...overrides,
  };
};

export const generatev193CigaretteLicenseData = (
  overrides: Partial<v193CigaretteLicenseData>,
): v193CigaretteLicenseData => {
  const taxId = randomInt(12).toString();
  const maskingCharacter = "*";
  return {
    businessName: `some-business-name-${randomInt()}`,
    responsibleOwnerName: `some-owner-name-${randomInt()}`,
    tradeName: `some-trade-name-${randomInt()}`,
    taxId: maskingCharacter.repeat(7) + taxId.slice(-5),
    encryptedTaxId: `encrypted-${taxId}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    mailingAddressIsTheSame: false,
    mailingAddressLine1: "",
    mailingAddressLine2: "",
    mailingAddressCity: "",
    mailingAddressState: undefined,
    mailingAddressZipCode: "",
    contactName: `some-contact-name-${randomInt()}`,
    contactPhoneNumber: `some-phone-number-${randomInt()}`,
    contactEmail: `some-email-${randomInt()}`,
    salesInfoStartDate: "08/31/2025",
    salesInfoSupplier: [],
    signerName: `some-signer-name-${randomInt()}`,
    signerRelationship: `some-signer-relationship-${randomInt()}`,
    signature: false,
    lastUpdatedISO: "",
    ...overrides,
  };
};

export const generatev193EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v193AirData>;
  landOverrides?: Partial<v193LandData>;
  wasteOverrides?: Partial<v193WasteData>;
  drinkingWaterOverrides?: Partial<v193DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v193WasteWaterData>;
}): v193QuestionnaireData => {
  return {
    air: {
      emitPollutants: false,
      emitEmissions: false,
      constructionActivities: false,
      noAir: false,
      ...airOverrides,
    },
    land: {
      takeOverExistingBiz: false,
      propertyAssessment: false,
      constructionActivities: false,
      siteImprovementWasteLands: false,
      noLand: false,
      ...landOverrides,
    },
    waste: {
      transportWaste: false,
      hazardousMedicalWaste: false,
      compostWaste: false,
      treatProcessWaste: false,
      constructionDebris: false,
      noWaste: false,
      ...wasteOverrides,
    },
    drinkingWater: {
      ownWell: false,
      combinedWellCapacity: false,
      wellDrilled: false,
      potableWater: false,
      noDrinkingWater: false,
      ...drinkingWaterOverrides,
    },
    wasteWater: {
      sanitaryWaste: false,
      industrialWaste: false,
      localSewage: false,
      septicSystem: false,
      streamsRiversOrLakes: false,
      needsTreatment: false,
      planningConstruction: false,
      stormWaterDischarge: false,
      takeoverIndustrialStormWaterPermit: false,
      noWasteWater: false,
      ...wasteWaterOverrides,
    },
  };
};
