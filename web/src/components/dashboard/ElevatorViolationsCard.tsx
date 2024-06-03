import { getMergedConfig } from "@/contexts/configContext";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";
import { useRouter } from "next/router";

export const ElevatorViolationsCard = (): ReactElement => {
  const router = useRouter()
  const config = getMergedConfig();
  return (
    <div className="radius-md padding-2 text-align-left border-2px border-error padding-2">
      <span className={"width-55 inline-block"}>{config.elevatorViolationsCard.violationNoticeMessage}</span>
      <span className={"inline-block float-right margin-top-1"}>
        <button
          className={"bg-error-dark radius-md usa-button padding-x-2"}
          onClick={() => {
            analytics.event.task_elevator_registration.click.view_my_violation_note_button_click();
            router.push("/violations/elevator-safety-violations");
          }}
        >
          <span className={"padding-right-1"}>{config.elevatorViolationsCard.violationNoticeCTA}</span>
        </button>
      </span>
    </div>
  );
};
