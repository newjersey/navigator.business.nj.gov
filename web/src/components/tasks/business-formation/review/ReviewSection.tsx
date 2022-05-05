import { Button } from "@/components/njwds-extended/Button";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { ReviewBusinessPurpose } from "@/components/tasks/business-formation/review/ReviewBusinessPurpose";
import { ReviewBusinessSuffixAndStartDate } from "@/components/tasks/business-formation/review/ReviewBusinessSuffixAndStartDate";
import { ReviewMainBusinessLocation } from "@/components/tasks/business-formation/review/ReviewMainBusinessLocation";
import { ReviewMembers } from "@/components/tasks/business-formation/review/ReviewMembers";
import { ReviewProvisions } from "@/components/tasks/business-formation/review/ReviewProvisions";
import { ReviewRegisteredAgent } from "@/components/tasks/business-formation/review/ReviewRegisteredAgent";
import { ReviewSignatures } from "@/components/tasks/business-formation/review/ReviewSignatures";
import analytics from "@/lib/utils/analytics";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";

export const ReviewSection = (): ReactElement => {
  const { state, setTab } = useContext(FormationContext);

  return (
    <>
      <div data-testid="review-section">
        <BusinessNameAndLegalStructure reviewPage />
        <ReviewBusinessSuffixAndStartDate />
        <ReviewMainBusinessLocation />
        {state.formationFormData.businessPurpose ? <ReviewBusinessPurpose /> : null}
        {state.formationFormData.provisions.length > 0 ? <ReviewProvisions /> : null}
        <ReviewRegisteredAgent />
        {state.formationFormData.members.length ? <ReviewMembers /> : null}
        <ReviewSignatures />
      </div>

      <div className="margin-top-2">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-top-3 margin-bottom-neg-205">
          <Button
            style="secondary"
            widthAutoOnMobile
            onClick={() => {
              setTab(state.tab - 1);
              scrollToTop();
            }}
          >
            {Config.businessFormationDefaults.previousButtonText}
          </Button>
          <Button
            style="primary"
            noRightMargin
            onClick={() => {
              analytics.event.business_formation_review_step_continue_button.click.go_to_next_formation_step();
              setTab(state.tab + 1);
              scrollToTop();
            }}
            widthAutoOnMobile
          >
            {Config.businessFormationDefaults.nextButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
