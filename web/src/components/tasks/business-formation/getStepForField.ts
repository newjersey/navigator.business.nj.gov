import { FormationStepNames } from "@/lib/types/types";
import { FormationFields } from "@businessnjgovnavigator/shared";

export const getStepForField = (field: FormationFields): FormationStepNames => {
  switch (field) {
    case "businessName":
      return "Name";

    case "businessSuffix":
    case "businessStartDate":
    case "businessAddressCity":
    case "businessAddressLine1":
    case "businessAddressZipCode":
    case "businessTotalStock":
    case "withdrawals":
    case "combinedInvestment":
    case "dissolution":
    case "canCreateLimitedPartner":
    case "canGetDistribution":
    case "canMakeDistribution":
    case "createLimitedPartnerTerms":
    case "getDistributionTerms":
    case "makeDistributionTerms":
      return "Business";

    case "agentNumber":
    case "agentName":
    case "agentEmail":
    case "agentOfficeAddressLine1":
    case "agentOfficeAddressCity":
    case "agentOfficeAddressZipCode":
    case "members":
    case "signers":
      return "Contacts";

    case "paymentType":
    case "contactFirstName":
    case "contactLastName":
    case "contactPhoneNumber":
      return "Billing";

    default:
      throw `Unknown step for field ${field}`;
  }
};
