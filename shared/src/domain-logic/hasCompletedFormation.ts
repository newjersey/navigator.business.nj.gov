import {Business} from "../userData";

export const hasCompletedFormation = (business: Business): boolean => {
  return business.formationData.completedFilingPayment;
};
