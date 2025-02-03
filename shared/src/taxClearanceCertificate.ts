import {emptyFormationAddressData, FormationAddress} from "./formationData";

export type TaxClearanceCertificateIssuingAgency = {
  name: string;
  displayName: string;
};

export type TaxClearanceCertificate = {
  issuingAgency: TaxClearanceCertificateIssuingAgency | undefined;
  businessName: string | undefined;
  entityId: string | undefined;
  taxId: string | undefined;
  encryptedTaxId: string | undefined;
  taxPin: string | undefined;
  address: FormationAddress | undefined
}

export const emptyTaxClearanceCertificateData = (): TaxClearanceCertificate => ({
  issuingAgency: undefined,
  businessName: undefined,
  entityId: undefined,
  taxId: undefined,
  encryptedTaxId: undefined,
  taxPin: undefined,
  address: emptyFormationAddressData,
});


export const TaxClearanceCertificateIssuingAgencies : TaxClearanceCertificateIssuingAgency[] = [
  { name: "New Jersey Board of Public Utilities", displayName: "New Jersey Board of Public Utilities" },
  {
    name: "New Jersey Department of Community Affairs",
    displayName: "New Jersey Department of Community Affairs",
  },
  { name: "New Jersey Department of Health", displayName: "New Jersey Department of Health" },
  {
    name: "New Jersey Department of Labor & Workforce Development",
    displayName: "New Jersey Department of Labor & Workforce Development",
  },
  {
    name: "New Jersey Department of Transportation",
    displayName: "New Jersey Department of Transportation",
  },
  {
    name: "New Jersey Economic Development Authority",
    displayName: "New Jersey Economic Development Authority",
  },
  {
    name: "New Jersey Casino Reinvestment Development Authority",
    displayName: " New Jersey Casino Reinvestment Development Authority",
  },
  {
    name: "New Jersey Commerce, Economic Growth & Tourism Commission",
    displayName: "New Jersey Commerce, Economic Growth & Tourism Commission",
  },
  {
    name: "New Jersey Commission on Science, innovation and Technology",
    displayName: " New Jersey Commission on Science, innovation and Technology",
  },
  {
    name: "New Jersey Department of Children & Families",
    displayName: "New Jersey Department of Children & Families",
  },
  {
    name: "New Jersey Department of Human Services",
    displayName: "New Jersey Department of Human Services",
  },
  { name: "New Jersey Department of Treasury", displayName: "New Jersey Department of Treasury" },
  {
    name: "New Jersey Housing & Mortgage Finance Agency",
    displayName: "New Jersey Housing & Mortgage Finance Agency",
  },
  { name: "New Jersey Secretary of State", displayName: "New Jersey Secretary of State" },
  { name: "New Jersey Redevelopment Authority", displayName: "New Jersey Redevelopment Authority" },
  {
    name: "New Jersey Department of Environmental Protection",
    displayName: "New Jersey Department of Environmental Protection",
  },
];

