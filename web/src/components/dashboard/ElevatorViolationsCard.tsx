import { Icon } from "@/components/njwds/Icon";
import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const ElevatorViolationsCard = (): ReactElement => {
  const config = getMergedConfig();
  return (
    <div className="radius-md padding-2 text-align-left border-2px border-error padding-2">
      <span className={"width-55 inline-block"}>{config.elevatorViolationsCard.violationNoticeMessage}</span>
      <span className={"inline-block float-right margin-top-1"}>
        <button
          className={"bg-error-dark radius-md usa-button padding-x-2"}
          onClick={() => {
            analytics.event.task_elevator_registration.click.view_my_violation_note_button_click();
            openInNewTab(config.elevatorViolationsCard.violationNoticeCTALink);
          }}
        >
          <span className={"padding-right-1"}>{config.elevatorViolationsCard.violationNoticeCTA}</span>
          <Icon>launch</Icon>
        </button>
      </span>
    </div>
  );
};
