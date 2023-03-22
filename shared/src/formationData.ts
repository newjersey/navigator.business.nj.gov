import { CountriesShortCodes } from "./countries";
import { Municipality } from "./municipality";
import { BusinessPersona } from "./profileData";
import { StateNames, StateObject } from "./states";

export const formationApiDateFormat = "MM/DD/YYYY";

export const defaultFormationLegalType: PublicFilingLegalType = "limited-liability-company";

export const castPublicFilingLegalTypeToFormationType = (
  legalStructureId: PublicFilingLegalType,
  persona: BusinessPersona | undefined
): FormationLegalType => {
  return `${persona === "FOREIGN" ? foreignLegalTypePrefix : ""}${legalStructureId}` as FormationLegalType;
};

export type SignerTitle =
  | "Authorized Representative"
  | "Authorized Partner"
  | "Incorporator"
  | "General Partner"
  | "President"
  | "Vice-President"
  | "Chairman of the Board"
  | "CEO"
  | "";

export const publicFilingLegalTypes = [
  "limited-liability-partnership",
  "limited-liability-company",
  "limited-partnership",
  "c-corporation",
  "s-corporation",
] as const;

export type PublicFilingLegalType = (typeof publicFilingLegalTypes)[number];

export const allFormationLegalTypes = [
  "limited-liability-partnership",
  "limited-liability-company",
  "limited-partnership",
  "c-corporation",
  "s-corporation",
  "foreign-limited-liability-partnership",
  "foreign-limited-liability-company",
  "foreign-limited-partnership",
  "foreign-c-corporation",
  "foreign-s-corporation",
] as const;

export type FormationLegalType = (typeof allFormationLegalTypes)[number];

export const foreignLegalTypePrefix = "foreign-";
export const BusinessSignerTypeMap: Record<FormationLegalType, SignerTitle[]> = {
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

export interface FormationData {
  readonly formationFormData: FormationFormData;
  readonly formationResponse: FormationSubmitResponse | undefined;
  readonly getFilingResponse: GetFilingResponse | undefined;
  readonly completedFilingPayment: boolean;
}

export type FormationBusinessLocationType = "US" | "INTL" | "NJ";
export interface FormationAddress {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: StateObject;
  readonly addressMunicipality?: Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: CountriesShortCodes | undefined;
  readonly businessLocationType: FormationBusinessLocationType | undefined;
}

export interface FormationSigner {
  readonly name: string;
  readonly signature: boolean;
  readonly title: SignerTitle;
}

export interface FormationIncorporator extends FormationSigner, FormationAddress {}

export interface FormationMember extends FormationAddress {
  readonly name: string;
}

export type ForeignGoodStandingFileObject = {
  Extension: "PDF" | "PNG";
  Content: string; // Binary contents converted to base64 string 4,000,000 string limit (3mb)
};

export interface FormationFormData extends FormationAddress {
  readonly legalType: FormationLegalType;
  readonly businessName: string;
  readonly businessSuffix: BusinessSuffix | undefined;
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
  readonly agentOfficeAddressMunicipality: Municipality | undefined;
  readonly agentOfficeAddressCity: string | undefined;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: FormationMember[] | undefined;
  readonly incorporators: FormationIncorporator[] | undefined;
  readonly signers: FormationSigner[] | undefined;
  readonly paymentType: PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
  readonly foreignStateOfFormation: StateNames | undefined;
  readonly foreignDateOfFormation: string | undefined; // YYYY-MM-DD
  readonly foreignGoodStandingFile: ForeignGoodStandingFileObject | undefined;
}

export type FormationFields = keyof FormationFormData;

export type FormationTextField = Exclude<
  keyof FormationFormData,
  | "businessSuffix"
  | "addressMunicipality"
  | "addressCountry"
  | "addressState"
  | "businessStartDate"
  | "agentNumberOrManual"
  | "paymentType"
  | "annualReportNotification"
  | "corpWatchNotification"
  | "officialFormationDocument"
  | "certificateOfStanding"
  | "certifiedCopyOfFormationDocument"
  | "members"
  | "signers"
  | "incorporators"
  | "agentUseAccountInfo"
  | "agentUseBusinessAddress"
  | "agentOfficeAddressMunicipality"
  | "provisions"
  | "businessName"
  | "canCreateLimitedPartner"
  | "canGetDistribution"
  | "canMakeDistribution"
  | "foreignDateOfFormation"
  | "foreignStateOfFormation"
  | "foreignGoodStandingFile"
>;

export const createEmptyFormationAddress = (): FormationAddress => {
  return {
    addressLine1: "",
    addressLine2: "",
    addressCity: undefined,
    addressMunicipality: undefined,
    addressState: undefined,
    addressZipCode: "",
    addressProvince: undefined,
    addressCountry: undefined,
    businessLocationType: undefined,
  };
};

export const createEmptyFormationSigner = (): FormationSigner => {
  return {
    name: "",
    signature: false,
    title: "",
  };
};

export const createEmptyFormationMember = (): FormationMember => {
  return {
    name: "",
    ...createEmptyFormationAddress(),
    addressCountry: "US",
    businessLocationType: "US",
  };
};

export const createEmptyFormationIncorporator = (): FormationIncorporator => {
  return {
    ...createEmptyFormationSigner(),
    ...createEmptyFormationMember(),
  };
};

export const createEmptyFormationFormData = (): FormationFormData => {
  return {
    ...createEmptyFormationAddress(),
    legalType: defaultFormationLegalType,
    businessName: "",
    businessSuffix: undefined,
    businessTotalStock: "",
    businessStartDate: "",
    businessPurpose: "",
    withdrawals: "",
    dissolution: "",
    combinedInvestment: "",
    canCreateLimitedPartner: undefined,
    createLimitedPartnerTerms: "",
    canGetDistribution: undefined,
    getDistributionTerms: "",
    canMakeDistribution: undefined,
    makeDistributionTerms: "",
    provisions: undefined,
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressMunicipality: undefined,
    agentOfficeAddressCity: undefined,
    agentOfficeAddressZipCode: "",
    agentUseAccountInfo: false,
    agentUseBusinessAddress: false,
    members: undefined,
    signers: undefined,
    incorporators: undefined,
    paymentType: undefined,
    annualReportNotification: true,
    corpWatchNotification: true,
    officialFormationDocument: true,
    certificateOfStanding: false,
    certifiedCopyOfFormationDocument: false,
    contactFirstName: "",
    contactLastName: "",
    contactPhoneNumber: "",
    foreignDateOfFormation: undefined,
    foreignStateOfFormation: undefined,
    foreignGoodStandingFile: undefined,
  };
};

export type PaymentType = "CC" | "ACH" | undefined;

export const llcBusinessSuffix = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY",
] as const;

export type LlcBusinessSuffix = (typeof llcBusinessSuffix)[number];

export const llpBusinessSuffix = [
  "LIMITED LIABILITY PARTNERSHIP",
  "LLP",
  "L.L.P.",
  "REGISTERED LIMITED LIABILITY PARTNERSHIP",
  "RLLP",
  "R.L.L.P.",
] as const;

export const lpBusinessSuffix = ["LIMITED PARTNERSHIP", "LP", "L.P."] as const;

export const corpBusinessSuffix = [
  "CORPORATION",
  "INCORPORATED",
  "COMPANY",
  "LTD",
  "CO",
  "CO.",
  "CORP",
  "CORP.",
  "INC",
  "INC.",
] as const;

export const foreignCorpBusinessSuffix = [...corpBusinessSuffix, "P.C.", "P.A."] as const;

export type CorpBusinessSuffix = (typeof corpBusinessSuffix)[number];

export type ForeignCorpBusinessSuffix = (typeof foreignCorpBusinessSuffix)[number];

export type LlpBusinessSuffix = (typeof llpBusinessSuffix)[number];

export type LpBusinessSuffix = (typeof lpBusinessSuffix)[number];

export const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...corpBusinessSuffix,
  ...foreignCorpBusinessSuffix,
] as const;

export type BusinessSuffix = (typeof AllBusinessSuffixes)[number];

export const BusinessSuffixMap: Record<
  FormationLegalType,
  | LlpBusinessSuffix[]
  | LlcBusinessSuffix[]
  | CorpBusinessSuffix[]
  | LpBusinessSuffix[]
  | ForeignCorpBusinessSuffix[]
> = {
  "limited-liability-company": llcBusinessSuffix as unknown as LlcBusinessSuffix[],
  "limited-liability-partnership": llpBusinessSuffix as unknown as LlpBusinessSuffix[],
  "limited-partnership": lpBusinessSuffix as unknown as LpBusinessSuffix[],
  "c-corporation": corpBusinessSuffix as unknown as CorpBusinessSuffix[],
  "s-corporation": corpBusinessSuffix as unknown as CorpBusinessSuffix[],
  "foreign-limited-liability-company": llcBusinessSuffix as unknown as LlcBusinessSuffix[],
  "foreign-limited-liability-partnership": llpBusinessSuffix as unknown as LlpBusinessSuffix[],
  "foreign-limited-partnership": lpBusinessSuffix as unknown as LpBusinessSuffix[],
  "foreign-c-corporation": foreignCorpBusinessSuffix as unknown as ForeignCorpBusinessSuffix[],
  "foreign-s-corporation": foreignCorpBusinessSuffix as unknown as ForeignCorpBusinessSuffix[],
};

export const corpLegalStructures: FormationLegalType[] = ["s-corporation", "c-corporation"];
export const incorporationLegalStructures: FormationLegalType[] = [
  ...corpLegalStructures,
  "limited-partnership",
];

export type FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: FormationSubmitError[];
  lastUpdatedISO: string | undefined;
};

export type FormationSubmitError = {
  field: string;
  type: "FIELD" | "UNKNOWN" | "RESPONSE";
  message: string;
};

export type GetFilingResponse = {
  success: boolean;
  entityId: string;
  transactionDate: string;
  confirmationNumber: string;
  formationDoc: string;
  standingDoc: string;
  certifiedDoc: string;
};
