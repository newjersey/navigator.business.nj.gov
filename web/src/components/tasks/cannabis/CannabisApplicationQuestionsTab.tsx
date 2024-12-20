import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { MicrobusinessRadioQuestion } from "@/components/tasks/cannabis/MicrobusinessRadioQuestion";
import { PriorityStatusCheckboxes } from "@/components/tasks/cannabis/PriorityStatusCheckboxes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import { ReactElement } from "react";

interface Props {
  onNextTab: () => void;
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onCheckboxChange: (checkbox: PriorityApplicationType, checked: boolean) => void;
  noPriorityStatus: boolean;
}

export const CannabisApplicationQuestionsTab = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <div className="flex flex-column">
      <Content>{Config.cannabisApplyForLicense.applicationQuestionsText}</Content>
      <HorizontalLine />
      <div className="margin-top-2">
        <Heading level={2} styleVariant="h3" className="margin-bottom-2 text-normal">
          {Config.cannabisApplyForLicense.businessSizeHeader}
        </Heading>
        <MicrobusinessRadioQuestion />
      </div>
      <div className="margin-top-4 margin-bottom-2">
        <Heading level={2} styleVariant="h3" className="margin-bottom-2 text-normal">
          {Config.cannabisApplyForLicense.priorityStatusHeader}
        </Heading>
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
      <CtaContainer>
        <ActionBarLayout disableReverseOrderInMobile>
          <PrimaryButton isColor="primary" isRightMarginRemoved={true} onClick={props.onNextTab}>
            {Config.cannabisApplyForLicense.viewRequirementsButton}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </div>
  );
};
