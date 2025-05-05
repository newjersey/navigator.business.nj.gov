import { getFormattedTimeFromInternalTime } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTimePicker";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { EmergencyTripPermitUserEnteredFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export interface Props {
  fieldName: EmergencyTripPermitUserEnteredFieldNames;
  optional?: boolean;
}

export const EmergencyTripPermitReviewField = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const fieldNameLabels = Config.abcEmergencyTripPermit.fields;
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  const getFilledOutValue = (): ReactElement => {
    if (context.state.applicationInfo[props.fieldName] === "") {
      return <span className={"text-italic bg-warning-light"}>Not Entered</span>;
    } else if (props.fieldName === "permitStartTime") {
      return (
        <span>
          {
            getFormattedTimeFromInternalTime(context.state.applicationInfo[props.fieldName])
              ?.displayTime
          }
        </span>
      );
    } else {
      return <span>{context.state.applicationInfo[props.fieldName]}</span>;
    }
  };
  return (
    <div className={"grid-row grid-gap"}>
      <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
        <span className={"text-bold"}>{`${fieldNameLabels[props.fieldName]}${
          props.optional ? "(Optional)" : ""
        }:`}</span>
      </span>
      <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>{getFilledOutValue()}</span>
    </div>
  );
};
