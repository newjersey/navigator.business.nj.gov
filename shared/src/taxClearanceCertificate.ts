import { orderBy } from "lodash";
import taxClearanceCertificateAgenciesJSON from "../../content/src/mappings/taxClearanceCertificateIssuingAgencies.json";
import { StateObject } from "./states";

export type TaxClearanceCertificateResponseErrorType =
  | "INELIGIBLE_TAX_CLEARANCE_FORM"
  | "FAILED_TAX_ID_AND_PIN_VALIDATION"
  | "MISSING_FIELD"
  | "NATURAL_PROGRAM_ERROR"
  | "TAX_ID_MISSING_FIELD"
  | "TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE"
  | "GENERIC_ERROR";

export type TaxClearanceCertificateResponse = {
  error?: {
    type: TaxClearanceCertificateResponseErrorType;
    message: string;
  };
  certificatePdfArray?: number[];
};

export const taxClearanceCertificateAgencies: TaxClearanceCertificateAgency[] =
  taxClearanceCertificateAgenciesJSON.arrayOfTaxClearanceCertificateIssuingAgencies;

export type TaxClearanceCertificateAgency = {
  name: string;
  id: string;
};

export const getTaxClearanceCertificateAgencies = (): TaxClearanceCertificateAgency[] =>
  orderBy(taxClearanceCertificateAgencies, ["name"], ["asc"]);

export const emptyTaxClearanceCertificateData: TaxClearanceCertificateData = {
  requestingAgencyId: "",
  businessName: "",
  addressLine1: "",
  addressLine2: "",
  addressCity: "",
  addressState: undefined,
  addressZipCode: "",
  taxId: "",
  encryptedTaxId: "",
  taxPin: "",
  encryptedTaxPin: "",
};

export type TaxClearanceCertificateData = {
  requestingAgencyId: string | undefined;
  businessName: string | undefined;
  addressLine1: string | undefined;
  addressLine2: string | undefined;
  addressCity: string | undefined;
  addressState?: StateObject;
  addressZipCode: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  taxPin: string | undefined;
  encryptedTaxPin: string | undefined;
};

export const LookupTaxClearanceCertificateAgenciesById = (
  id: string | undefined,
): TaxClearanceCertificateAgency => {
  return (
    taxClearanceCertificateAgencies.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
    }
  );
};
