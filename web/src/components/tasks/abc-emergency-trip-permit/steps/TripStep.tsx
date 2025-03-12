import { EmergencyTripPermitDatePicker } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitDatePicker";
import { EmergencyTripPermitTimePicker } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTimePicker";
import { ReactElement } from "react";

export const TripStep = (): ReactElement => {
  return (
    <div>
      <EmergencyTripPermitDatePicker fieldName={"permitDate"} />
      <EmergencyTripPermitTimePicker fieldName={"permitStartTime"} />
    </div>
  );
};
