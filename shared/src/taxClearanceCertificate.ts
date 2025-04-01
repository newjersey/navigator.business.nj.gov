import { orderBy } from "lodash";
import taxClearanceCertificateAgenciesJSON from "../../content/src/mappings/taxClearanceCertificateIssuingAgencies.json";
import { StateObject } from "./states";

export type TaxClearanceCertificateResponse = {
  error?: {
    type:
      | "INELIGIBLE_TAX_CLEARANCE_FORM"
      | "FAILED_TAX_ID_AND_PIN_VALIDATION"
      | "MISSING_FIELD"
      | "SYSTEM_ERROR";
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
  entityId: "",
  addressLine1: "",
  addressLine2: "",
  addressCity: "",
  addressState: undefined,
  addressZipCode: "",
  taxId: "",
  taxPin: "",
};

export type TaxClearanceCertificateData = {
  requestingAgencyId: string;
  businessName: string;
  entityId: string;
  addressLine1: string;
  addressLine2: string;
  addressCity: string;
  addressState?: StateObject;
  addressZipCode: string;
  taxId: string;
  taxPin: string;
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
