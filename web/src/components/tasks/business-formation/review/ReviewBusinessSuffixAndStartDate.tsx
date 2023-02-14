import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { defaultDisplayDateFormat } from "@/lib/types/types";
import { defaultDateFormat } from "@businessnjgovnavigator/shared";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { ReactElement, useContext } from "react";

export const ReviewBusinessSuffixAndStartDate = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  const getBusinessNameDisplay = (): string => {
    const name = state.formationFormData.businessName || italicNotEnteredText;
    const suffix = state.formationFormData.businessSuffix || italicNotEnteredText;
    return `${name} ${suffix}`;
  };

  return (
    <div className="margin-top-2" data-testid="review-suffix-and-start-date">
      <ReviewLineItem
        label={Config.formation.fields.businessSuffix.reviewStepLabel}
        value={getBusinessNameDisplay()}
      />
      <ReviewLineItem
        label={Config.formation.fields.businessStartDate.reviewStepLabel}
        value={parseDateWithFormat(state.formationFormData.businessStartDate, defaultDateFormat).format(
          defaultDisplayDateFormat
        )}
      />
      {state.formationFormData.businessLocationType != "NJ" && (
        <>
          <ReviewLineItem
            dataTestId="foreign-state-of-formation"
            label={Config.formation.fields.foreignStateOfFormation.reviewStepLabel}
            value={state.formationFormData.foreignStateOfFormation ?? italicNotEnteredText}
          />
          <ReviewLineItem
            dataTestId="foreign-date-of-formation"
            label={Config.formation.fields.foreignDateOfFormation.reviewStepLabel}
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
          label={Config.formation.fields.businessTotalStock.reviewStepLabel}
          value={state.formationFormData.businessTotalStock}
        />
      )}
      <hr className="margin-y-205" />
    </div>
  );
};
