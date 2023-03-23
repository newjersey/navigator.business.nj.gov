import { FormationFields } from "@businessnjgovnavigator/shared/formationData";
import { invert } from "lodash";

export const UNKNOWN_API_ERROR_FIELD = "UNKNOWN_API_ERROR_FIELD";

const fieldToApiFieldMapping: Record<string, string> = {
  agentNumber: "Registered Agent - Id",
  agentName: "Registered Agent - Name",
  agentEmail: "Registered Agent - Email",
  contactFirstName: "Contact First Name",
  contactLastName: "Contact Last Name",
  contactPhoneNumber: "Contact Phone Number",
  agentOfficeAddressLine1: "Registered Agent - Street Address - Address1",
  agentOfficeAddressLine2: "Registered Agent - Street Address - Address2",
  agentOfficeAddressMunicipality: "Registered Agent - Street Address - City",
  agentOfficeAddressZipCode: "Registered Agent - Street Address - Zipcode",
  paymentType: "Select Payment Type",
  businessSuffix: "Business Information - Business Designator",
  businessStartDate: "Business Information - Effective Filing Date",
  addressLine1: "Business Information - Street Address - Address1",
  addressLine2: "Business Information - Street Address - Address2",
  addressCity: "Business Information - Street Address - City",
  addressState: "Business Information - Street Address - State",
  addressZipCode: "Business Information - Street Address - Zipcode",
  addressProvince: "Business Information - Street Address - Province",
  addressCountry: "Business Information - Street Address - Country",
};

const apiFieldToFieldMapping = invert(fieldToApiFieldMapping);

export const getApiField = (field: FormationFields): string => {
  return fieldToApiFieldMapping[field] || UNKNOWN_API_ERROR_FIELD;
};

export const getFieldByApiField = (apiField: string): string => {
  return apiFieldToFieldMapping[apiField] || UNKNOWN_API_ERROR_FIELD;
};
