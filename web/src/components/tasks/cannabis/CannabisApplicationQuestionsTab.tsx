import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { MicrobusinessRadioQuestion } from "@/components/tasks/cannabis/MicrobusinessRadioQuestion";
import { PriorityStatusCheckboxes } from "@/components/tasks/cannabis/PriorityStatusCheckboxes";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

interface Props {
  onNextTab: () => void;
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onCheckboxChange: (checkbox: PriorityApplicationType, checked: boolean) => void;
  noPriorityStatus: boolean;
}

export const CannabisApplicationQuestionsTab = (props: Props): ReactElement => {
  return (
    <div className="flex flex-column">
      <Content>{Config.cannabisApplyForLicense.applicationQuestionsText}</Content>
      <div>
        <hr className="margin-y-3" />
      </div>
      <div className="margin-top-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-2 text-normal">
          {Config.cannabisApplyForLicense.businessSizeHeader}
        </div>
        <MicrobusinessRadioQuestion />
      </div>
      <div className="margin-top-4 margin-bottom-2">
        <div role="heading" aria-level={2} className="h3-styling margin-bottom-2 text-normal">
          {Config.cannabisApplyForLicense.priorityStatusHeader}
        </div>
        {!props.noPriorityStatus && (
          <>
            <Content>{Config.cannabisApplyForLicense.priorityStatusText}</Content>
            <PriorityStatusCheckboxes
              onCheckboxChange={props.onCheckboxChange}
              priorityStatusState={props.priorityStatusState}
            />
          </>
        )}
        {props.noPriorityStatus && (
          <div className="margin-bottom-3">
            <Content>{Config.cannabisApplyForLicense.priorityStatusNoneSelectedText}</Content>
          </div>
        )}
      </div>
      <div
        style={{ marginTop: "auto" }}
        className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-bottom-neg-205 flex-column mobile-lg:flex-row"
      >
        <Button
          className="mobile-lg:margin-top-0 margin-top-1"
          style="primary"
          noRightMargin
          onClick={props.onNextTab}
        >
          {Config.cannabisApplyForLicense.viewRequirementsButton}
        </Button>
      </div>
    </div>
  );
};
