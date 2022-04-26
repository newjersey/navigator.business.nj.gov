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
  readonly name: string;
  readonly signature: boolean;
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
  readonly agentNumberOrManual: "NUMBER" | "MANUAL_ENTRY";
  readonly agentNumber: string;
  readonly agentName: string;
  readonly agentEmail: string;
  readonly agentOfficeAddressLine1: string;
  readonly agentOfficeAddressLine2: string;
  readonly agentOfficeAddressCity: string;
  readonly agentOfficeAddressState: string;
  readonly agentOfficeAddressZipCode: string;
  readonly members: readonly FormationMember[];
  readonly signer: FormationSigner;
  readonly additionalSigners: readonly FormationSigner[];
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
  readonly success: boolean;
  readonly token: string | undefined;
  readonly formationId: string | undefined;
  readonly redirect: string | undefined;
  readonly errors: readonly FormationSubmitError[];
};

export type FormationSubmitError = {
  readonly field: string;
  readonly type: "FIELD" | "UNKNOWN" | "RESPONSE";
  readonly message: string;
};

export type GetFilingResponse = {
  readonly success: boolean;
  readonly entityId: string;
  readonly transactionDate: string;
  readonly confirmationNumber: string;
  readonly formationDoc: string;
  readonly standingDoc: string;
  readonly certifiedDoc: string;
};
