import { orderBy } from "lodash";
import taxClearanceCertificateAgenciesJSON from "../../content/src/mappings/taxClearanceCertificateIssuingAgencies.json";

const taxClearanceCertificateAgencies: TaxClearanceCertificateAgency[] =
  taxClearanceCertificateAgenciesJSON.arrayOfTaxClearanceCertificateIssuingAgencies;

export type TaxClearanceCertificateAgency = {
  name: string;
  id: string;
};

export const getTaxClearanceCertificateAgencies = (): TaxClearanceCertificateAgency[] =>
  orderBy(taxClearanceCertificateAgencies, ["name"], ["asc"]);

export const emptyTaxClearanceCertificateData = {
  requestingAgencyId: "",
  // businessName: "",
  // entityId: "",
  // addressLine1: "",
  // addressLine2: "",
  // addressCity: "",
  // addressState: "",
  // addressZipCode: "",
  // taxId: "",
  // taxPin: "",
};

export type TaxClearanceCertificateData = {
  requestingAgencyId: string;
  // businessName: string;
  // entityId: string;
  // addressLine1: string;
  // addressLine2: string;
  // addressCity: string;
  // addressState: string;
  // addressZipCode: string;
  // taxId: string;
  // taxPin: string;
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
