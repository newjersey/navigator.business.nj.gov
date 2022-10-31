import { Municipality } from "./municipality";

export const defaultFormationLegalType: FormationLegalType = "limited-liability-company";

export const FormationLegalTypes = [
  "limited-liability-partnership",
  "limited-liability-company",
  "limited-partnership",
  "c-corporation",
  "s-corporation",
] as const;

export type FormationLegalType = typeof FormationLegalTypes[number];

export interface FormationData {
  readonly formationFormData: FormationFormData;
  readonly formationResponse: FormationSubmitResponse | undefined;
  readonly getFilingResponse: GetFilingResponse | undefined;
  readonly completedFilingPayment: boolean;
}

export interface FormationAddress {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
  readonly signature: boolean;
}

export interface FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: BusinessSuffix | undefined;
  readonly businessTotalStock: string;
  readonly businessStartDate: string;
  readonly businessAddressCity: Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
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
  readonly provisions: string[];
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  readonly agentUseAccountInfo: boolean;
  readonly agentUseBusinessAddress: boolean;
  readonly members: FormationAddress[];
  readonly signers: FormationAddress[];
  readonly paymentType: PaymentType;
  readonly annualReportNotification: boolean;
  readonly corpWatchNotification: boolean;
  readonly officialFormationDocument: boolean;
  readonly certificateOfStanding: boolean;
  readonly certifiedCopyOfFormationDocument: boolean;
  readonly contactFirstName: string;
  readonly contactLastName: string;
  readonly contactPhoneNumber: string;
}

export type FormationFields = keyof FormationFormData;

export type FormationTextField = Exclude<
  keyof FormationFormData,
  | "businessSuffix"
  | "businessAddressCity"
  | "businessStartDate"
  | "agentNumberOrManual"
  | "signers"
  | "paymentType"
  | "annualReportNotification"
  | "corpWatchNotification"
  | "officialFormationDocument"
  | "certificateOfStanding"
  | "certifiedCopyOfFormationDocument"
  | "members"
  | "agentUseAccountInfo"
  | "agentUseBusinessAddress"
  | "provisions"
  | "businessName"
  | "canCreateLimitedPartner"
  | "canGetDistribution"
  | "canMakeDistribution"
>;

export const createEmptyFormationAddress = (): FormationAddress => {
  return {
    name: "",
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressState: "",
    addressZipCode: "",
    signature: false,
  };
};

export const createEmptyFormationFormData = (): FormationFormData => {
  return {
    businessName: "",
    businessSuffix: undefined,
    businessTotalStock: "",
    businessStartDate: "",
    businessAddressCity: undefined,
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "NJ",
    businessAddressZipCode: "",
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
    provisions: [],
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressCity: "",
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: "",
    agentUseAccountInfo: false,
    agentUseBusinessAddress: false,
    members: [],
    signers: [],
    paymentType: undefined,
    annualReportNotification: true,
    corpWatchNotification: true,
    officialFormationDocument: true,
    certificateOfStanding: false,
    certifiedCopyOfFormationDocument: false,
    contactFirstName: "",
    contactLastName: "",
    contactPhoneNumber: "",
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

export type LlcBusinessSuffix = typeof llcBusinessSuffix[number];

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

export type CorpBusinessSuffix = typeof corpBusinessSuffix[number];

export type LlpBusinessSuffix = typeof llpBusinessSuffix[number];

export type LpBusinessSuffix = typeof lpBusinessSuffix[number];

export const AllBusinessSuffixes = [
  ...llcBusinessSuffix,
  ...llpBusinessSuffix,
  ...lpBusinessSuffix,
  ...corpBusinessSuffix,
] as const;

export type BusinessSuffix = typeof AllBusinessSuffixes[number];

export const BusinessSuffixMap: Record<
  FormationLegalType,
  LlpBusinessSuffix[] | LlcBusinessSuffix[] | CorpBusinessSuffix[] | LpBusinessSuffix[]
> = {
  "limited-liability-company": llcBusinessSuffix as unknown as LlcBusinessSuffix[],
  "limited-liability-partnership": llpBusinessSuffix as unknown as LlpBusinessSuffix[],
  "limited-partnership": lpBusinessSuffix as unknown as LpBusinessSuffix[],
  "c-corporation": corpBusinessSuffix as unknown as CorpBusinessSuffix[],
  "s-corporation": corpBusinessSuffix as unknown as CorpBusinessSuffix[],
};

export const corpLegalStructures: FormationLegalType[] = ["s-corporation", "c-corporation"];

export type FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  formationId: string | undefined;
  redirect: string | undefined;
  errors: FormationSubmitError[];
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
