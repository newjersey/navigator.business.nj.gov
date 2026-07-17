import {
  v191Business,
  v191BusinessUser,
  v191CigaretteLicenseData,
  v191UserData,
} from "@db/migrations/v191_rotate_new_kms_keys";
import { randomInt } from "@shared/intHelpers";
import { type MigrationClients } from "@db/migrations/types";

const reEncryptDeptOfLaborEin = async (
  encryptedValue: string | undefined,
  clients: MigrationClients,
): Promise<string> => {
  if (encryptedValue === "" || !encryptedValue) return "";

  if (!clients.legacyTaxIdCryptoClient) {
    throw new Error("legacyTaxIdCryptoClient is required");
  }

  const plaintext = await clients.legacyTaxIdCryptoClient.decryptValue(encryptedValue);
  return await clients.cryptoClient.encryptValue(plaintext);
};

const reEncryptValue = async (
  encryptedValue: string | undefined,
  clients: MigrationClients,
): Promise<string | undefined> => {
  if (!encryptedValue) {
    return encryptedValue;
  }

  if (!clients.legacyTaxIdCryptoClient) {
    throw new Error("legacyTaxIdCryptoClient is required");
  }

  const plaintext = await clients.legacyTaxIdCryptoClient.decryptValue(encryptedValue);
  return await clients.cryptoClient.encryptValue(plaintext);
};

const reEncryptAndHashTaxId = async (
  encryptedTaxId: string | undefined,
  clients: MigrationClients,
): Promise<{
  encryptedTaxId: string | undefined;
  hashedTaxId: string | undefined;
}> => {
  if (!encryptedTaxId) {
    return {
      encryptedTaxId,
      hashedTaxId: undefined,
    };
  }

  if (!clients.legacyTaxIdCryptoClient) {
    throw new Error("legacyTaxIdCryptoClient is required");
  }

  if (!clients.newHashingClient) {
    throw new Error("newHashingClient is required");
  }

  const plaintext = await clients.legacyTaxIdCryptoClient.decryptValue(encryptedTaxId);

  return {
    encryptedTaxId: await clients.cryptoClient.encryptValue(plaintext),
    hashedTaxId: await clients.newHashingClient.hashValue(plaintext),
  };
};

export const migrate_v191_to_v192 = async (
  userData: v191UserData,
  clients?: MigrationClients,
): Promise<v192UserData> => {
  if (!clients) {
    throw new Error("Migration v192 requires migration clients");
  }

  const migratedBusinesses = await Promise.all(
    Object.values(userData.businesses).map(async (business) => {
      const migratedBusiness = await migrate_v191Business_to_v192Business(business, clients);

      return [migratedBusiness.id, migratedBusiness] as const;
    }),
  );

  return {
    ...userData,
    user: migrate_v191BusinessUser_to_v192BusinessUser(userData.user),
    businesses: Object.fromEntries(migratedBusinesses),
    version: 192,
  };
};

const migrate_v191BusinessUser_to_v192BusinessUser = (
  user: v191BusinessUser,
): v192BusinessUser => ({
  ...user,
});

const migrate_v191CigaretteLicenseData_to_v192CigaretteLicenseData = (
  cigaretteLicenseData: v191CigaretteLicenseData | undefined,
): v192CigaretteLicenseData | undefined => {
  if (!cigaretteLicenseData?.paymentInfo) {
    return cigaretteLicenseData;
  }

  const { confirmationEmailsent, ...restPaymentInfo } = cigaretteLicenseData.paymentInfo;

  return {
    ...cigaretteLicenseData,
    paymentInfo: {
      ...restPaymentInfo,
      confirmationEmailSent: confirmationEmailsent,
    },
  };
};

const migrate_v191Business_to_v192Business = async (
  business: v191Business,
  clients: MigrationClients,
): Promise<v192Business> => {
  const { encryptedTaxId, hashedTaxId } = await reEncryptAndHashTaxId(
    business.profileData.encryptedTaxId,
    clients,
  );

  const cigaretteEncryptedTaxId = await reEncryptValue(
    business.cigaretteLicenseData?.encryptedTaxId,
    clients,
  );

  const encryptedTaxPin = await reEncryptValue(business.profileData.encryptedTaxPin, clients);

  const encryptedDeptOfLaborEin = await reEncryptDeptOfLaborEin(
    business.profileData.deptOfLaborEin,
    clients,
  );

  const migratedCigaretteLicenseData = migrate_v191CigaretteLicenseData_to_v192CigaretteLicenseData(
    business.cigaretteLicenseData,
  );

  return {
    ...business,
    profileData: {
      ...business.profileData,
      encryptedTaxId,
      hashedTaxId,
      encryptedTaxPin,
      deptOfLaborEin: encryptedDeptOfLaborEin,
    },
    cigaretteLicenseData: migratedCigaretteLicenseData
      ? {
          ...migratedCigaretteLicenseData,
          encryptedTaxId: cigaretteEncryptedTaxId,
        }
      : migratedCigaretteLicenseData,
  };
};

export interface v192IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean | undefined;
  homeBasedBusiness?: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  cannabisLicenseType: v192CannabisLicenseType;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  carService: v192CarServiceType | undefined;
  interstateTransport: boolean | undefined;
  interstateLogistics: boolean | undefined;
  interstateMoving: boolean | undefined;
  isChildcareForSixOrMore: boolean | undefined;
  petCareHousing: boolean | undefined;
  willSellPetCareItems: boolean | undefined;
  constructionType: v192ConstructionType;
  residentialConstructionType: v192ResidentialConstructionType;
  employmentPersonnelServiceType: v192EmploymentAndPersonnelServicesType;
  employmentPlacementType: v192EmploymentPlacementType;
  propertyLeaseType: v192PropertyLeaseType;
  hasThreeOrMoreRentalUnits: boolean | undefined;
  publicWorksContractor: boolean | undefined;
}

export type v192PropertyLeaseType = "SHORT_TERM_RENTAL" | "LONG_TERM_RENTAL" | "BOTH" | undefined;

// ---------------- v192 types ----------------
type v192TaskProgress = "TO_DO" | "COMPLETED";
type v192OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
type v192ABExperience = "ExperienceA" | "ExperienceB";

export interface v192UserData {
  user: v192BusinessUser;
  version: number;
  lastUpdatedISO: string;
  dateCreatedISO: string;
  versionWhenCreated: number;
  businesses: Record<string, v192Business>;
  currentBusinessId: string;
}

export interface v192Business {
  id: string;
  dateCreatedISO: string;
  lastUpdatedISO: string;
  dateDeletedISO: string;
  profileData: v192ProfileData;
  onboardingFormProgress: v192OnboardingFormProgress;
  taskProgress: Record<string, v192TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v192LicenseData | undefined;
  preferences: v192Preferences;
  taxFilingData: v192TaxFilingData;
  formationData: v192FormationData;
  environmentData: v192EnvironmentData | undefined;
  xrayRegistrationData: v192XrayData | undefined;
  crtkData: v192CrtkData | undefined;
  roadmapTaskData: v192RoadmapTaskData;
  taxClearanceCertificateData: v192TaxClearanceCertificateData | undefined;
  cigaretteLicenseData: v192CigaretteLicenseData | undefined;
  version: number;
  versionWhenCreated: number;
  userId: string;
}

export interface v192RoadmapTaskData {
  manageBusinessVehicles?: boolean;
  passengerTransportSchoolBus?: boolean;
  passengerTransportSixteenOrMorePassengers?: boolean;
}

export interface v192ProfileData extends v192IndustrySpecificData {
  businessPersona: v192BusinessPersona;
  businessName: string;
  responsibleOwnerName: string;
  tradeName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v192Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  hashedTaxId: string | undefined;
  encryptedTaxId: string | undefined;
  notes: string;
  documents: v192ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessTypeIds: v192ForeignBusinessTypeId[];
  nexusDbaName: string;
  operatingPhase: v192OperatingPhase;
  nonEssentialRadioAnswers: Record<string, boolean | undefined>;
  elevatorOwningBusiness: boolean | undefined;
  communityAffairsAddress?: v192CommunityAffairsAddress;
  plannedRenovationQuestion: boolean | undefined;
  raffleBingoGames: boolean | undefined;
  businessOpenMoreThanTwoYears: boolean | undefined;
  employerAccessRegistration: boolean | undefined;
  deptOfLaborEin: string;
}

export type v192CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: v192Municipality;
};

export type v192BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  receiveUpdatesAndReminders: boolean;
  externalStatus: v192ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v192ABExperience;
  accountCreationSource: string;
  contactSharingWithAccountCreationPartner: boolean;
  phoneNumber?: string;
};

export interface v192ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v192BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v192OperatingPhase =
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

export type v192CannabisLicenseType = "CONDITIONAL" | "ANNUAL" | undefined;
export type v192CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;
export type v192ConstructionType = "RESIDENTIAL" | "COMMERCIAL_OR_INDUSTRIAL" | "BOTH" | undefined;
export type v192ResidentialConstructionType =
  | "NEW_HOME_CONSTRUCTION"
  | "HOME_RENOVATIONS"
  | "BOTH"
  | undefined;
export type v192EmploymentAndPersonnelServicesType = "JOB_SEEKERS" | "EMPLOYERS" | undefined;
export type v192EmploymentPlacementType = "TEMPORARY" | "PERMANENT" | "BOTH" | undefined;

type v192ForeignBusinessTypeId =
  | "employeeOrContractorInNJ"
  | "officeInNJ"
  | "propertyInNJ"
  | "companyOperatedVehiclesInNJ"
  | "employeesInNJ"
  | "revenueInNJ"
  | "transactionsInNJ"
  | "none";

export type v192Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v192TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v192TaxFilingErrorFields = "businessName" | "formFailure";

export type v192TaxFilingData = {
  state?: v192TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v192TaxFilingErrorFields;
  businessName?: string;
  filings: v192TaxFilingCalendarEvent[];
};

export type v192CalendarEvent = {
  readonly dueDate: string; // YYYY-MM-DD
  readonly calendarEventType: "TAX-FILING" | "LICENSE";
};

export interface v192TaxFilingCalendarEvent extends v192CalendarEvent {
  readonly identifier: string;
  readonly calendarEventType: "TAX-FILING";
}

export type v192LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface v192LicenseSearchNameAndAddress extends v192LicenseSearchAddress {
  name: string;
}

export type v192LicenseDetails = {
  nameAndAddress: v192LicenseSearchNameAndAddress;
  licenseStatus: v192LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: v192LicenseStatusItem[];
};

const v192taskIdLicenseNameMapping = {
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

type v192LicenseTaskID = keyof typeof v192taskIdLicenseNameMapping;

export type v192LicenseName = (typeof v192taskIdLicenseNameMapping)[v192LicenseTaskID];

type v192Licenses = Partial<Record<v192LicenseName, v192LicenseDetails>>;

export type v192LicenseData = {
  lastUpdatedISO: string;
  licenses?: v192Licenses;
};

export type v192Preferences = {
  roadmapOpenSections: v192SectionType[];
  roadmapOpenSteps: number[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
  isNonProfitFromFunding?: boolean;
};

export type v192LicenseStatusItem = {
  title: string;
  status: v192CheckoffStatus;
};

type v192CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v192LicenseStatus =
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

const v192LicenseStatuses: v192LicenseStatus[] = [
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

const v192SectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type v192SectionType = (typeof v192SectionNames)[number];

export type v192ExternalStatus = {
  newsletter?: v192NewsletterResponse;
  userTesting?: v192UserTestingResponse;
};

export interface v192NewsletterResponse {
  success?: boolean;
  status: v192NewsletterStatus;
}

export interface v192UserTestingResponse {
  success?: boolean;
  status: v192UserTestingStatus;
}

type v192NewsletterStatus = (typeof newsletterStatusList)[number];

const externalStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "CONNECTION_ERROR",
  "RESPONSE_ERROR",
] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v192UserTestingStatus = (typeof userTestingStatusList)[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

type v192NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface v192NameAvailabilityResponse {
  status: v192NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface v192NameAvailability extends v192NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}

export interface v192FormationData {
  formationFormData: v192FormationFormData;
  businessNameAvailability: v192NameAvailability | undefined;
  dbaBusinessNameAvailability: v192NameAvailability | undefined;
  formationResponse: v192FormationSubmitResponse | undefined;
  getFilingResponse: v192GetFilingResponse | undefined;
  completedFilingPayment: boolean;
  lastVisitedPageIndex: number;
}

type v192InFormInBylaws = "IN_BYLAWS" | "IN_FORM" | undefined;
type v192HowToProceedOptions = "DIFFERENT_NAME" | "KEEP_NAME" | "CANCEL_NAME";

export interface v192FormationFormData extends v192FormationAddress {
  readonly businessName: string;
  readonly businessNameConfirmation: boolean | undefined;
  readonly businessSuffix: v192BusinessSuffix | undefined;
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
  readonly nonprofitBoardMemberQualificationsSpecified: v192InFormInBylaws;
  readonly nonprofitBoardMemberQualificationsTerms: string;
  readonly nonprofitBoardMemberRightsSpecified: v192InFormInBylaws;
  readonly nonprofitBoardMemberRightsTerms: string;
  readonly nonprofitTrusteesMethodSpecified: v192InFormInBylaws;
  readonly nonprofitTrusteesMethodTerms: string;
  readonly nonprofitAssetDistributionSpecified: v192InFormInBylaws;
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
  readonly members: v192FormationMember[] | undefined;
  readonly incorporators: v192FormationIncorporator[] | undefined;
  readonly signers: v192FormationSigner[] | undefined;
  readonly paymentType: v192PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v192StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v192ForeignGoodStandingFileObject | undefined;
  readonly legalType: string;
  readonly willPracticeLaw: boolean | undefined;
  readonly isVeteranNonprofit: boolean | undefined;
  readonly checkNameReservation: boolean | undefined;
  readonly howToProceed: v192HowToProceedOptions;
}

export type v192ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

export type v192StateObject = {
  shortCode: string;
  name: string;
};

export interface v192FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v192StateObject;
  readonly addressMunicipality?: v192Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry?: string;
  readonly businessLocationType: v192FormationBusinessLocationType | undefined;
}

type v192FormationBusinessLocationType = "US" | "INTL" | "NJ";

type v192SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

export interface v192FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v192SignerTitle;
}

export interface v192FormationIncorporator extends v192FormationSigner, v192FormationAddress {}

export interface v192FormationMember extends v192FormationAddress {
  readonly name: string;
}

type v192PaymentType = "CC" | "ACH" | undefined;

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

type v192BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export type v192FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v192FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type v192FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type v192GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

export interface v192EnvironmentData {
  questionnaireData?: v192QuestionnaireData;
  submitted?: boolean;
  emailSent?: boolean;
}

export type v192QuestionnaireData = {
  air: v192AirData;
  land: v192LandData;
  waste: v192WasteData;
  drinkingWater: v192DrinkingWaterData;
  wasteWater: v192WasteWaterData;
};

export type v192AirFieldIds =
  | "emitPollutants"
  | "emitEmissions"
  | "constructionActivities"
  | "noAir";

export type v192AirData = Record<v192AirFieldIds, boolean>;

export type v192LandFieldIds =
  | "takeOverExistingBiz"
  | "propertyAssessment"
  | "constructionActivities"
  | "siteImprovementWasteLands"
  | "noLand";

export type v192LandData = Record<v192LandFieldIds, boolean>;

export type v192WasteFieldIds =
  | "transportWaste"
  | "hazardousMedicalWaste"
  | "compostWaste"
  | "treatProcessWaste"
  | "constructionDebris"
  | "noWaste";

export type v192WasteData = Record<v192WasteFieldIds, boolean>;

export type v192DrinkingWaterFieldIds =
  | "ownWell"
  | "combinedWellCapacity"
  | "wellDrilled"
  | "potableWater"
  | "noDrinkingWater";

export type v192DrinkingWaterData = Record<v192DrinkingWaterFieldIds, boolean>;

export type v192WasteWaterFieldIds =
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

export type v192WasteWaterData = Record<v192WasteWaterFieldIds, boolean>;

export type v192CrtkBusinessDetails = {
  businessName: string;
  addressLine1: string;
  city: string;
  addressZipCode: string;
  ein?: string | undefined;
};

export type v192CrtkSearchResult = "FOUND" | "NOT_FOUND";

export interface v192CrtkEntry {
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

export interface v192CrtkEmailMetadata {
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

export type v192CrtkData = {
  lastUpdatedISO: string;
  crtkBusinessDetails?: v192CrtkBusinessDetails;
  crtkSearchResult: v192CrtkSearchResult;
  crtkEntry: v192CrtkEntry;
  crtkEmailSent?: boolean;
};

export type v192TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: v192StateObject | undefined;
  addressZipCode?: string | undefined;
  taxId: string | undefined;
  taxPin: string | undefined;
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
};

export type v192CigaretteLicenseData = {
  businessName?: string;
  responsibleOwnerName?: string;
  tradeName?: string;
  taxId?: string;
  encryptedTaxId?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressCity?: string;
  addressState?: v192StateObject;
  addressZipCode?: string;
  mailingAddressIsTheSame?: boolean;
  mailingAddressLine1?: string;
  mailingAddressLine2?: string;
  mailingAddressCity?: string;
  mailingAddressState?: v192StateObject;
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
  paymentInfo?: v192CigaretteLicensePaymentInfo;
};

export type v192CigaretteLicensePaymentInfo = {
  token?: string;
  paymentComplete?: boolean;
  orderId?: number;
  orderStatus?: string;
  orderTimestamp?: string;
  confirmationEmailSent?: boolean;
};

export type v192XrayData = {
  facilityDetails?: v192FacilityDetails;
  machines?: v192MachineDetails[];
  status?: v192XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
  lastUpdatedISO?: string;
};

export type v192FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type v192MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type v192XrayRegistrationStatusResponse = {
  machines: v192MachineDetails[];
  status: v192XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type v192XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

// ---------------- v192 generators ----------------

export const generatev192UserData = (overrides: Partial<v192UserData>): v192UserData => {
  return {
    user: generatev192BusinessUser({}),
    version: 192,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev192Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev192BusinessUser = (
  overrides: Partial<v192BusinessUser>,
): v192BusinessUser => {
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

export const generatev192RoadmapTaskData = (
  overrides: Partial<v192RoadmapTaskData>,
): v192RoadmapTaskData => {
  return {
    manageBusinessVehicles: undefined,
    passengerTransportSchoolBus: undefined,
    passengerTransportSixteenOrMorePassengers: undefined,
    ...overrides,
  };
};

export const generatev192Business = (overrides: Partial<v192Business>): v192Business => {
  const profileData = generatev192ProfileData({});

  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: profileData,
    preferences: generatev192Preferences({}),
    formationData: generatev192FormationData({}, profileData.legalStructureId ?? ""),
    onboardingFormProgress: "UNSTARTED",
    taxClearanceCertificateData: generatev192TaxClearanceCertificateData({}),
    cigaretteLicenseData: generatev192CigaretteLicenseData({}),
    taskProgress: {
      "business-structure": "TO_DO",
    },
    taskItemChecklist: {
      "general-dvob": false,
    },
    roadmapTaskData: generatev192RoadmapTaskData({}),
    licenseData: undefined,
    taxFilingData: generatev192TaxFilingData({}),
    environmentData: undefined,
    xrayRegistrationData: undefined,
    crtkData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 192,
    versionWhenCreated: -1,
    ...overrides,
  };
};

export const generatev192ProfileData = (overrides: Partial<v192ProfileData>): v192ProfileData => {
  const id = `some-id-${randomInt()}`;
  const persona = randomInt() % 2 ? "STARTING" : "OWNING";
  return {
    ...generatev192IndustrySpecificData({}),
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

export const generatev192IndustrySpecificData = (
  overrides: Partial<v192IndustrySpecificData>,
): v192IndustrySpecificData => {
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

export const generatev192Preferences = (overrides: Partial<v192Preferences>): v192Preferences => {
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

export const generatev192FormationData = (
  overrides: Partial<v192FormationData>,
  legalStructureId: string,
): v192FormationData => {
  return {
    formationFormData: generatev192FormationFormData({}, legalStructureId),
    formationResponse: undefined,
    getFilingResponse: undefined,
    completedFilingPayment: false,
    businessNameAvailability: undefined,
    lastVisitedPageIndex: 0,
    dbaBusinessNameAvailability: undefined,
    ...overrides,
  };
};

export const generatev192FormationFormData = (
  overrides: Partial<v192FormationFormData>,
  legalStructureId: string,
): v192FormationFormData => {
  const isCorp = legalStructureId
    ? ["s-corporation", "c-corporation"].includes(legalStructureId)
    : false;

  return <v192FormationFormData>{
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
    addressMunicipality: generatev192Municipality({}),
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
      legalStructureId === "limited-liability-partnership" ? [] : [generatev192FormationMember({})],
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

export const generatev192Municipality = (
  overrides: Partial<v192Municipality>,
): v192Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generatev192FormationMember = (
  overrides: Partial<v192FormationMember>,
): v192FormationMember => {
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

export const generatev192TaxFilingData = (
  overrides: Partial<v192TaxFilingData>,
): v192TaxFilingData => {
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

export const generatev192LicenseDetails = (
  overrides: Partial<v192LicenseDetails>,
): v192LicenseDetails => {
  return {
    nameAndAddress: generatev192LicenseSearchNameAndAddress({}),
    licenseStatus: getRandomv192LicenseStatus(),
    expirationDateISO: "some-expiration-iso",
    lastUpdatedISO: "some-last-updated",
    checklistItems: [generatev192LicenseStatusItem()],
    ...overrides,
  };
};

const generatev192LicenseSearchNameAndAddress = (
  overrides: Partial<v192LicenseSearchNameAndAddress>,
): v192LicenseSearchNameAndAddress => {
  return {
    name: `some-name`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    zipCode: `some-agent-office-zipcode-${randomInt()}`,
    ...overrides,
  };
};

const generatev192LicenseStatusItem = (): v192LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
  };
};

export const getRandomv192LicenseStatus = (): v192LicenseStatus => {
  const randomIndex = Math.floor(Math.random() * v192LicenseStatuses.length);
  return v192LicenseStatuses[randomIndex];
};

export const generatev192TaxClearanceCertificateData = (
  overrides: Partial<v192TaxClearanceCertificateData>,
): v192TaxClearanceCertificateData => {
  return {
    requestingAgencyId: "",
    businessName: `some-business-name-${randomInt()}`,
    addressLine1: `addr1-${randomInt(3)}`,
    addressLine2: `addr2-${randomInt(3)}`,
    addressCity: `city-${randomInt(3)}`,
    addressState: undefined,
    addressZipCode: randomInt(5).toString(),
    taxId: `${randomInt(12)}`,
    taxPin: randomInt(4).toString(),
    hasPreviouslyReceivedCertificate: undefined,
    lastUpdatedISO: "",
    ...overrides,
  };
};

export const generatev192CigaretteLicenseData = (
  overrides: Partial<v192CigaretteLicenseData>,
): v192CigaretteLicenseData => {
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

export const generatev192EnvironmentQuestionnaireData = ({
  airOverrides,
  landOverrides,
  wasteOverrides,
  drinkingWaterOverrides,
  wasteWaterOverrides,
}: {
  airOverrides?: Partial<v192AirData>;
  landOverrides?: Partial<v192LandData>;
  wasteOverrides?: Partial<v192WasteData>;
  drinkingWaterOverrides?: Partial<v192DrinkingWaterData>;
  wasteWaterOverrides?: Partial<v192WasteWaterData>;
}): v192QuestionnaireData => {
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
