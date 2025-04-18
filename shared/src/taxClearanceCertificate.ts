import { orderBy } from "lodash";
import taxClearanceCertificateAgenciesJSON from "../../content/src/mappings/taxClearanceCertificateIssuingAgencies.json";
import { StateObject } from "./states";

export type TaxClearanceCertificateResponse = {
  error?: {
    type:
      | "INELIGIBLE_TAX_CLEARANCE_FORM"
      | "FAILED_TAX_ID_AND_PIN_VALIDATION"
      | "MISSING_FIELD"
      | "NATURAL_PROGRAM_ERROR";
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
  taxPin: "",
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
  taxPin: string | undefined;
};

export const LookupTaxClearanceCertificateAgenciesById = (
  id: string | undefined
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
