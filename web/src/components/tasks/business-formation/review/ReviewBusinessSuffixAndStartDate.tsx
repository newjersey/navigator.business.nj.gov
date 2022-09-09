import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { ReactElement, useContext } from "react";

export const ReviewBusinessSuffixAndStartDate = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  const getBusinessNameDisplay = (): string => {
    const name = userData?.profileData.businessName || italicNotEnteredText;
    const suffix = state.formationFormData.businessSuffix || italicNotEnteredText;
    return `${name} ${suffix}`;
  };

  return (
    <div className="margin-top-2">
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepBusinessSuffixLabel}
        value={getBusinessNameDisplay()}
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepBusinessStartDateLabel}
        value={parseDateWithFormat(state.formationFormData.businessStartDate, "YYYY-MM-DD").format(
          "MM/DD/YYYY"
        )}
      />
      {state.formationFormData.businessTotalStock.length > 0 && (
        <ReviewLineItem
          label={Config.businessFormationDefaults.reviewBusinessTotalStockLabel}
          value={state.formationFormData.businessTotalStock}
        />
      )}
      <hr className="margin-y-205" />
    </div>
  );
};
