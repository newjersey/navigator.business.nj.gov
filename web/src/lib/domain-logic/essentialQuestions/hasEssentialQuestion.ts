import { isCannabisLicenseApplicable } from "@/lib/domain-logic/essentialQuestions/isCannabisLicenseApplicable";
import { isCarServiceApplicable } from "@/lib/domain-logic/essentialQuestions/isCarServiceApplicable";
import { isCertifiedInteriorDesignerApplicable } from "@/lib/domain-logic/essentialQuestions/isCertifiedInteriorDesignerApplicable";
import { isChildcareForSixOrMoreApplicable } from "@/lib/domain-logic/essentialQuestions/isChildcareForSixOrMoreApplicable";
import { isCpaRequiredApplicable } from "@/lib/domain-logic/essentialQuestions/isCpaRequiredApplicable";
import { isInterstateLogisticsApplicable } from "@/lib/domain-logic/essentialQuestions/isInterstateLogisticsApplicable";
import { isInterstateMovingApplicable } from "@/lib/domain-logic/essentialQuestions/isInterstateMovingApplicable";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/essentialQuestions/isLiquorLicenseApplicable";
import { isProvidesStaffingServicesApplicable } from "@/lib/domain-logic/essentialQuestions/isProvidesStaffingServicesApplicable";
import { isRealEstateAppraisalManagementApplicable } from "@/lib/domain-logic/essentialQuestions/isRealEstateAppraisalManagementApplicable";

export const hasEssentialQuestion = (industryId: string | undefined) =>
  [
    isCannabisLicenseApplicable(industryId),
    isCarServiceApplicable(industryId),
    isCertifiedInteriorDesignerApplicable(industryId),
    isChildcareForSixOrMoreApplicable(industryId),
    isCpaRequiredApplicable(industryId),
    isInterstateLogisticsApplicable(industryId),
    isInterstateMovingApplicable(industryId),
    isLiquorLicenseApplicable(industryId),
    isProvidesStaffingServicesApplicable(industryId),
    isRealEstateAppraisalManagementApplicable(industryId),
  ].includes(true);
