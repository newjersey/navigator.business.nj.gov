import { orderBy } from "lodash";
import taxClearanceCertificateAgenciesJSON from "@businessnjgovnavigator/content/mappings/taxClearanceCertificateIssuingAgencies.json";
import { StateObject } from "@businessnjgovnavigator/shared/states";

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
  hasPreviouslyReceivedCertificate: false,
  lastUpdatedISO: undefined,
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
  hasPreviouslyReceivedCertificate: boolean | undefined;
  lastUpdatedISO: string | undefined;
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
