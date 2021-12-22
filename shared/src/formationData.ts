export interface FormationData {
  formationFormData: FormationFormData;
  formationResponse: FormationSubmitResponse | undefined;
}

export interface FormationFormData {
  businessSuffix: BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  businessAddressZipCode: string;
  agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  agentNumber: string;
  agentName: string;
  agentEmail: string;
  agentOfficeAddressLine1: string;
  agentOfficeAddressLine2: string;
  agentOfficeAddressCity: string;
  agentOfficeAddressState: string;
  agentOfficeAddressZipCode: string;
  signer: string;
  additionalSigners: string[];
  paymentType: PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
}

export type FormationTextField = Exclude<
  keyof FormationFormData,
  | "businessSuffix"
  | "businessStartDate"
  | "additionalSigners"
  | "paymentType"
  | "annualReportNotification"
  | "corpWatchNotification"
  | "agentNumberOrManual"
  | "officialFormationDocument"
  | "certificateOfStanding"
  | "certifiedCopyOfFormationDocument"
>;

export const createEmptyFormationFormData = (): FormationFormData => {
  return {
    businessSuffix: undefined,
    businessStartDate: "",
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "NJ",
    businessAddressZipCode: "",
    agentNumberOrManual: "NUMBER",
    agentNumber: "",
    agentName: "",
    agentEmail: "",
    agentOfficeAddressLine1: "",
    agentOfficeAddressLine2: "",
    agentOfficeAddressCity: "",
    agentOfficeAddressState: "NJ",
    agentOfficeAddressZipCode: "",
    signer: "",
    additionalSigners: [],
    paymentType: undefined,
    annualReportNotification: false,
    corpWatchNotification: false,
    officialFormationDocument: true,
    certificateOfStanding: false,
    certifiedCopyOfFormationDocument: false,
  };
};

export type PaymentType = "CC" | "ACH" | undefined;

export type BusinessSuffix =
  | "LLC"
  | "L.L.C."
  | "LTD LIABILITY CO"
  | "LTD LIABILITY CO."
  | "LTD LIABILITY COMPANY"
  | "LIMITED LIABILITY CO"
  | "LIMITED LIABILITY CO."
  | "LIMITED LIABILITY COMPANY";

export const AllBusinessSuffixes = [
  "LLC",
  "L.L.C.",
  "LTD LIABILITY CO",
  "LTD LIABILITY CO.",
  "LTD LIABILITY COMPANY",
  "LIMITED LIABILITY CO",
  "LIMITED LIABILITY CO.",
  "LIMITED LIABILITY COMPANY",
];

export type FormationSubmitResponse = {
  success: boolean;
  token: string | undefined;
  redirect: string | undefined;
  errors: FormationSubmitError[];
};

export type FormationSubmitError = {
  field: string;
  message: string;
};
