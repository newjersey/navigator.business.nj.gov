import dayjs from "dayjs";

export interface FormationData {
  businessSuffix: BusinessSuffix | undefined;
  businessStartDate: string;
  businessAddressLine1: string;
  businessAddressLine2: string;
  businessAddressState: string;
  // businessAddressCounty: string;
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
  // signatures: string[];
  // paymentType: "CC" | "ACH" | undefined;
}

export type FormationTextField = Exclude<
  keyof FormationData,
  "businessSuffix" | "businessStartDate" | "agentNumberOrManual"
>;

export const createEmptyFormationData = (): FormationData => {
  return {
    businessSuffix: undefined,
    businessStartDate: dayjs().format("YYYY-MM-DD"),
    businessAddressLine1: "",
    businessAddressLine2: "",
    businessAddressState: "NJ",
    // businessAddressCounty: "",
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
    // signatures: [],
    // paymentType: undefined,
  };
};

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
