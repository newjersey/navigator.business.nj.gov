import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { defaultDisplayDateFormat } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { defaultDateFormat } from "@businessnjgovnavigator/shared";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { ReactElement, useContext } from "react";

export const ReviewBusinessSuffixAndStartDate = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  const getBusinessNameDisplay = (): string => {
    const name = state.formationFormData.businessName || italicNotEnteredText;
    const suffix = state.formationFormData.businessSuffix || italicNotEnteredText;
    return `${name} ${suffix}`;
  };

  return (
    <div className="margin-top-2" data-testid="review-suffix-and-start-date">
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepBusinessSuffixLabel}
        value={getBusinessNameDisplay()}
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepBusinessStartDateLabel}
        value={parseDateWithFormat(state.formationFormData.businessStartDate, defaultDateFormat).format(
          defaultDisplayDateFormat
        )}
      />
      {state.formationFormData.businessLocationType != "NJ" && (
        <>
          <ReviewLineItem
            dataTestId="foreign-state-of-formation"
            label={state.displayContent.foreignStateOfFormationHeader.reviewHeader}
            value={state.formationFormData.foreignStateOfFormation ?? italicNotEnteredText}
          />
          <ReviewLineItem
            dataTestId="foreign-date-of-formation"
            label={state.displayContent.foreignDateOfFormationHeader.reviewHeader}
            value={
              state.formationFormData.foreignDateOfFormation
                ? parseDateWithFormat(
                    state.formationFormData.foreignDateOfFormation,
                    defaultDateFormat
                  ).format(defaultDisplayDateFormat)
                : italicNotEnteredText
            }
          />
        </>
      )}
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
