export interface FormationData {
  formationFormData: FormationFormData;
  formationResponse: FormationSubmitResponse | undefined;
  getFilingResponse: GetFilingResponse | undefined;
}

export interface FormationMember {
  name: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
}

export interface FormationSigner {
  name: string;
  signature: boolean;
}

export interface FormationFormData {
  businessName: string;
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
  members: FormationMember[];
  signer: FormationSigner;
  additionalSigners: FormationSigner[];
  paymentType: PaymentType;
  annualReportNotification: boolean;
  corpWatchNotification: boolean;
  officialFormationDocument: boolean;
  certificateOfStanding: boolean;
  certifiedCopyOfFormationDocument: boolean;
  contactFirstName: string;
  contactLastName: string;
  contactPhoneNumber: string;
}

export type FormationTextField = Exclude<
  keyof FormationFormData,
  | "businessSuffix"
  | "businessStartDate"
  | "agentNumberOrManual"
  | "signer"
  | "additionalSigners"
  | "paymentType"
  | "annualReportNotification"
  | "corpWatchNotification"
  | "officialFormationDocument"
  | "certificateOfStanding"
  | "certifiedCopyOfFormationDocument"
  | "members"
>;

export const createEmptyFormationMember = (): FormationMember => ({
  name: "",
  addressLine1: "",
  addressLine2: "",
  addressCity: "",
  addressState: "",
  addressZipCode: "",
});

export const createEmptyFormationFormData = (): FormationFormData => {
  return {
    businessName: "",
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
    members: [],
    signer: {
      name: "",
      signature: false,
    },
    additionalSigners: [],
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
