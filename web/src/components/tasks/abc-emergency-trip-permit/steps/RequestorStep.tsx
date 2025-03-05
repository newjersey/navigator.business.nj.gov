import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTextField";
import { ReactElement } from "react";

export const RequestorStep = (): ReactElement => {
  return (
    <>
      <EmergencyTripPermitTextFieldEntry fieldName={"carrier"} label={"Carrier"} />
      <div>
        <EmergencyTripPermitTextFieldEntry fieldName={"firstName"} label={"Requestor First Name"} />
        <EmergencyTripPermitTextFieldEntry fieldName={"lastName"} label={"Requestor Last Name"} />
      </div>
    </>
  );
};
