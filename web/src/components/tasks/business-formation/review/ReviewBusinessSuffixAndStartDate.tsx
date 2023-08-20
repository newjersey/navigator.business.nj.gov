import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { defaultDisplayDateFormat } from "@/lib/types/types";
import { defaultDateFormat } from "@businessnjgovnavigator/shared";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { ReactElement, useContext } from "react";

export const ReviewBusinessSuffixAndStartDate = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const isCorp =
    state.formationFormData.legalType === "c-corporation" ||
    state.formationFormData.legalType === "s-corporation";

  const getBusinessNameDisplay = (): string | undefined => {
    const name = state.formationFormData.businessName;
    const suffix = state.formationFormData.businessSuffix;
    if (!name || !suffix) {
      return undefined;
    }
    return `${name} ${suffix}`;
  };

  return (
    <div className="margin-top-2" data-testid="review-suffix-and-start-date">
      <ReviewLineItem
        label={Config.formation.fields.businessSuffix.label}
        labelContextualInfo={Config.formation.fields.businessSuffix.labelContextualInfo}
        value={getBusinessNameDisplay()}
      />
      <ReviewLineItem
        label={Config.formation.fields.businessStartDate.label}
        labelContextualInfo={Config.formation.fields.businessStartDate.labelContextualInfo}
        value={parseDateWithFormat(state.formationFormData.businessStartDate, defaultDateFormat).format(
          defaultDisplayDateFormat,
        )}
      />
      {state.formationFormData.businessLocationType !== "NJ" && (
        <>
          <ReviewLineItem
            dataTestId="foreign-state-of-formation"
            label={Config.formation.fields.foreignStateOfFormation.label}
            value={state.formationFormData.foreignStateOfFormation}
          />
          <ReviewLineItem
            dataTestId="foreign-date-of-formation"
            label={Config.formation.fields.foreignDateOfFormation.label}
            value={
              state.formationFormData.foreignDateOfFormation
                ? parseDateWithFormat(
                    state.formationFormData.foreignDateOfFormation,
                    defaultDateFormat,
                  ).format(defaultDisplayDateFormat)
                : undefined
            }
          />
        </>
      )}
      {isCorp && (
        <ReviewLineItem
          label={Config.formation.fields.businessTotalStock.label}
          value={state.formationFormData.businessTotalStock}
          dataTestId={"review-total-business-stock"}
        />
      )}
    </div>
  );
};
