import { Municipality } from "./municipality";

export interface FormationData {
  readonly formationFormData: FormationFormData;
  readonly formationResponse: FormationSubmitResponse | undefined;
  readonly getFilingResponse: GetFilingResponse | undefined;
}

export interface FormationMember {
  readonly name: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressZipCode: string;
}

export interface FormationSigner {
  name: string;
  signature: boolean;
}

export interface FormationFormData {
  readonly businessName: string;
  readonly businessSuffix: BusinessSuffix | undefined;
  readonly businessStartDate: string;
  readonly businessAddressCity: Municipality | undefined;
  readonly businessAddressLine1: string;
  readonly businessAddressLine2: string;
  readonly businessAddressState: string;
  readonly businessAddressZipCode: string;
  readonly businessPurpose: string;
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  members: FormationMember[];
  readonly signer: FormationSigner;
  additionalSigners: FormationSigner[];
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

export type FormationTextField = Exclude<
  keyof FormationFormData,
  | "businessSuffix"
  | "businessAddressCity"
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
    businessAddressCity: undefined,
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "NJ",
    businessAddressZipCode: "",
    businessPurpose: "",
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
