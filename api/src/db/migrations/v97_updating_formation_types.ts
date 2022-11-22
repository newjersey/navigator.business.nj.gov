import { v96UserData } from "./v96_added_date_field_to_tax_filing_data";

interface v97UserData {
  user: v97BusinessUser;
  profileData: v97ProfileData;
  formProgress: v97FormProgress;
  taskProgress: Record<string, v97TaskProgress>;
  taskItemChecklist: Record<string, boolean>;
  licenseData: v97LicenseData | undefined;
  preferences: v97Preferences;
  taxFilingData: v97TaxFilingData;
  formationData: v97FormationData;
  version: number;
}

export const migrate_v96_to_v97 = (v96Data: v96UserData): v97UserData => {
  const {
    formationData: { formationFormData, ...remainingFormation },
    ...props
  } = v96Data;
  const {
    members,
    signers,
    businessAddressCity,
    businessAddressLine1,
    businessAddressLine2,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    businessAddressState,
    businessAddressZipCode,
    ...newFormationFormData
  } = formationFormData;
  return {
    ...props,
    formationData: {
      ...remainingFormation,
      formationFormData: {
        ...newFormationFormData,
        foreignDateOfFormation: undefined,
        foreignGoodStandingFile: undefined,
        foreignStateOfFormation: undefined,
        agentOfficeAddressMunicipality: undefined,
        signers: !["s-corporation", "c-corporation", "limited-partnership"].includes(
          props.profileData.legalStructureId ?? ""
        )
          ? signers.map((signer) => {
              return {
                name: signer.name,
                signature: signer.signature,
                title: v97businessSignerTypeMap[props.profileData.legalStructureId ?? ""][0],
              };
            })
          : undefined,
        incorporators: ["s-corporation", "c-corporation", "limited-partnership"].includes(
          props.profileData.legalStructureId ?? ""
        )
          ? signers.map((signer) => {
              return {
                ...signer,
                addressState: arrayOfStateObjects.find((state) => {
                  return state.name == signer.addressState;
                }),
                addressCountry: "US",
                title: v97businessSignerTypeMap[props.profileData.legalStructureId ?? ""][0],
              };
            })
          : undefined,
        members: ["limited-partnership", "limited-liability-partnership"].includes(
          props.profileData.legalStructureId ?? ""
        )
          ? undefined
          : members.map((member) => {
              return {
                ...member,
                addressState: arrayOfStateObjects.find((state) => {
                  return state.name == member.addressState;
                }),
                addressCountry: "US",
              };
            }),
        addressLine1: businessAddressLine1,
        addressLine2: businessAddressLine2,
        addressZipCode: businessAddressZipCode,
        addressState: { name: "New Jersey", shortCode: "NJ" },
        addressCountry: "US",
        addressMunicipality: businessAddressCity,
      },
    },
    version: 97,
  };
};

// ---------------- v97 types ----------------

const v97businessSignerTypeMap: Record<string, v97SignerTitle[]> = {
  "limited-liability-company": ["Authorized Representative"],
  "limited-liability-partnership": ["Authorized Partner"],
  "limited-partnership": ["General Partner"],
  "c-corporation": ["Incorporator"],
  "s-corporation": ["Incorporator"],
  "foreign-limited-liability-company": ["Authorized Representative", "General Partner"],
  "foreign-limited-liability-partnership": ["Authorized Representative", "General Partner"],
  "foreign-limited-partnership": ["Authorized Representative", "General Partner"],
  "foreign-c-corporation": ["President", "Vice-President", "Chairman of the Board", "CEO"],
  "foreign-s-corporation": ["President", "Vice-President", "Chairman of the Board", "CEO"],
};

type v97TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type v97FormProgress = "UNSTARTED" | "COMPLETED";
type v97ABExperience = "ExperienceA" | "ExperienceB";

type v97BusinessUser = {
  name?: string;
  email: string;
  id: string;
  receiveNewsletter: boolean;
  userTesting: boolean;
  externalStatus: v97ExternalStatus;
  myNJUserKey?: string;
  intercomHash?: string;
  abExperience: v97ABExperience;
};

interface v97ProfileDocuments {
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
}

type v97BusinessPersona = "STARTING" | "OWNING" | "FOREIGN" | undefined;
type v97ForeignBusinessType = "REMOTE_WORKER" | "REMOTE_SELLER" | "NEXUS" | "NONE" | undefined;
type v97OperatingPhase =
  | "GUEST_MODE"
  | "NEEDS_TO_FORM"
  | "NEEDS_TO_REGISTER_FOR_TAXES"
  | "FORMED_AND_REGISTERED"
  | "UP_AND_RUNNING"
  | "UP_AND_RUNNING_OWNING"
  | undefined;

type v97CarServiceType = "STANDARD" | "HIGH_CAPACITY" | "BOTH" | undefined;

interface v97IndustrySpecificData {
  liquorLicense: boolean;
  requiresCpa: boolean;
  homeBasedBusiness: boolean | undefined;
  cannabisLicenseType: "CONDITIONAL" | "ANNUAL" | undefined;
  cannabisMicrobusiness: boolean | undefined;
  constructionRenovationPlan: boolean | undefined;
  providesStaffingService: boolean;
  certifiedInteriorDesigner: boolean;
  realEstateAppraisalManagement: boolean;
  carService: v97CarServiceType | undefined;
  interstateTransport: boolean;
  isChildcareForSixOrMore: boolean | undefined;
}

interface v97ProfileData extends v97IndustrySpecificData {
  businessPersona: v97BusinessPersona;
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: v97Municipality | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
  documents: v97ProfileDocuments;
  ownershipTypeIds: string[];
  existingEmployees: string | undefined;
  taxPin: string | undefined;
  sectorId: string | undefined;
  naicsCode: string;
  foreignBusinessType: v97ForeignBusinessType;
  foreignBusinessTypeIds: string[];
  nexusLocationInNewJersey: boolean | undefined;
  nexusDbaName: string | undefined;
  operatingPhase: v97OperatingPhase;
}

type v97Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

type v97TaxFilingState = "SUCCESS" | "FAILED" | "UNREGISTERED" | "PENDING" | "API_ERROR";
type v97TaxFilingErrorFields = "Business Name" | "Taxpayer ID";

type v97TaxFilingData = {
  state?: v97TaxFilingState;
  lastUpdatedISO?: string;
  registeredISO?: string;
  errorField?: v97TaxFilingErrorFields;
  businessName?: string;
  filings: v97TaxFiling[];
};

type v97TaxFiling = {
  identifier: string;
  dueDate: string;
};

type v97NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

type v97LicenseData = {
  nameAndAddress: v97NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: v97LicenseStatus;
  items: v97LicenseStatusItem[];
};

type v97Preferences = {
  roadmapOpenSections: v97SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  isCalendarFullView: boolean;
  returnToLink: string;
  isHideableRoadmapOpen: boolean;
};

type v97LicenseStatusItem = {
  title: string;
  status: v97CheckoffStatus;
};

type v97CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

type v97LicenseStatus =
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

const v97SectionNames = ["PLAN", "START"] as const;
type v97SectionType = typeof v97SectionNames[number];

type v97ExternalStatus = {
  newsletter?: v97NewsletterResponse;
  userTesting?: v97UserTestingResponse;
};

interface v97NewsletterResponse {
  success?: boolean;
  status: v97NewsletterStatus;
}

interface v97UserTestingResponse {
  success?: boolean;
  status: v97UserTestingStatus;
}

type v97NewsletterStatus = typeof newsletterStatusList[number];

const externalStatusList = ["SUCCESS", "IN_PROGRESS", "CONNECTION_ERROR"] as const;

const userTestingStatusList = [...externalStatusList] as const;

type v97UserTestingStatus = typeof userTestingStatusList[number];

const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_WARNING",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "QUESTION_WARNING",
] as const;

interface v97FormationData {
  formationFormData: v97FormationFormData;
  formationResponse: v97FormationSubmitResponse | undefined;
  getFilingResponse: v97GetFilingResponse | undefined;
  completedFilingPayment: boolean;
}

interface v97FormationFormData extends v97FormationAddress {
  readonly businessName: string;
  readonly businessSuffix: v97BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: v97Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: v97FormationMember[] | undefined;
  readonly incorporators: v97FormationIncorporator[] | undefined;
  readonly signers: v97FormationSigner[] | undefined;
  readonly paymentType: v97PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: v97StateObject | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: v97ForeignGoodStandingFileObject | undefined;
}

type v97ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string;
};

type v97StateObject = {
  shortCode: string;
  name: string;
};

interface v97FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: v97StateObject;
  readonly addressMunicipality?: v97Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: string;
}

type v97SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO";

interface v97FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: v97SignerTitle;
}

interface v97FormationIncorporator extends v97FormationSigner, v97FormationAddress {}

interface v97FormationMember extends v97FormationAddress {
  readonly name: string;
}

type v97PaymentType = "CC" | "ACH" | undefined;

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

type v97BusinessSuffix = typeof AllBusinessSuffixes[number];

type v97FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: v97FormationSubmitError[];
};

type v97FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

type v97GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};

const arrayOfStateObjects = [
  { shortCode: "AK", name: "Alaska" },
  { shortCode: "AL", name: "Alabama" },
  { shortCode: "AR", name: "Arkansas" },
  { shortCode: "AS", name: "American Samoa" },
  { shortCode: "AZ", name: "Arizona" },
  { shortCode: "CA", name: "California" },
  { shortCode: "CO", name: "Colorado" },
  { shortCode: "CT", name: "Connecticut" },
  { shortCode: "DC", name: "District of Columbia" },
  { shortCode: "DE", name: "Delaware" },
  { shortCode: "FL", name: "Florida" },
  { shortCode: "GA", name: "Georgia" },
  { shortCode: "GU", name: "Guam" },
  { shortCode: "HI", name: "Hawaii" },
  { shortCode: "IA", name: "Iowa" },
  { shortCode: "ID", name: "Idaho" },
  { shortCode: "IL", name: "Illinois" },
  { shortCode: "IN", name: "Indiana" },
  { shortCode: "KS", name: "Kansas" },
  { shortCode: "KY", name: "Kentucky" },
  { shortCode: "LA", name: "Louisiana" },
  { shortCode: "MA", name: "Massachusetts" },
  { shortCode: "MD", name: "Maryland" },
  { shortCode: "ME", name: "Maine" },
  { shortCode: "MI", name: "Michigan" },
  { shortCode: "MN", name: "Minnesota" },
  { shortCode: "MO", name: "Missouri" },
  { shortCode: "MS", name: "Mississippi" },
  { shortCode: "MT", name: "Montana" },
  { shortCode: "NC", name: "North Carolina" },
  { shortCode: "ND", name: "North Dakota" },
  { shortCode: "NE", name: "Nebraska" },
  { shortCode: "NH", name: "New Hampshire" },
  { shortCode: "NJ", name: "New Jersey" },
  { shortCode: "NM", name: "New Mexico" },
  { shortCode: "NV", name: "Nevada" },
  { shortCode: "NY", name: "New York" },
  { shortCode: "OH", name: "Ohio" },
  { shortCode: "OK", name: "Oklahoma" },
  { shortCode: "OR", name: "Oregon" },
  { shortCode: "PA", name: "Pennsylvania" },
  { shortCode: "PR", name: "Puerto Rico" },
  { shortCode: "RI", name: "Rhode Island" },
  { shortCode: "SC", name: "South Carolina" },
  { shortCode: "SD", name: "South Dakota" },
  { shortCode: "TN", name: "Tennessee" },
  { shortCode: "TX", name: "Texas" },
  { shortCode: "UT", name: "Utah" },
  { shortCode: "VA", name: "Virginia" },
  { shortCode: "VI", name: "Virgin Islands" },
  { shortCode: "VT", name: "Vermont" },
  { shortCode: "WA", name: "Washington" },
  { shortCode: "WI", name: "Wisconsin" },
  { shortCode: "WV", name: "West Virginia" },
  { shortCode: "WY", name: "Wyoming" },
];
