import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const ElevatorViolationsCard = (): ReactElement => {
  const config = getMergedConfig();

  const violationMessage = (
    <div className="margin-bottom-2 mobile-lg:margin-bottom-0 mobile-lg:margin-right-1">
      {config.elevatorViolationsCard.violationNoticeMessage}
    </div>
  );

  return (
    <div className="radius-md padding-2 border-2px border-error padding-2">
      <ActionBarLayout disableReverseOrderInMobile stackOnLeft={violationMessage}>
        <div className="flex-shrink-0">
          <PrimaryButton
            isColor="error"
            isRightMarginRemoved
            onClick={() => {
              analytics.event.task_elevator_registration.click.view_my_violation_note_button_click();
              openInNewTab(config.elevatorViolationsCard.violationNoticeCTALink);
            }}
          >
            <span className="padding-right-1">{config.elevatorViolationsCard.violationNoticeCTA}</span>
            <Icon>launch</Icon>
          </PrimaryButton>
        </div>
      </ActionBarLayout>
    </div>
  );
};
