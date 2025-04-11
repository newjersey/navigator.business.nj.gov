import { Heading } from "@/components/njwds-extended/Heading";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitCountryDropdown";
import { EmergencyTripPermitDatePicker } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitDatePicker";
import { EmergencyTripPermitStateDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStateDropdown";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTextField";
import { EmergencyTripPermitTimePicker } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTimePicker";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getCurrentDateInNewJersey } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { ReactElement, useContext } from "react";

export const TripStep = (): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);

  return (
    <form className={`usa-prose onboarding-form margin-top-2`}>
      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.trip.subHeader}</Heading>
      </div>
      <div>
        <div className={"grid-row grid-gap padding-bottom-1"}>
          <div className={"grid-col-6"}>
            <strong>{Config.abcEmergencyTripPermit.fields.permitDate}</strong>
            <EmergencyTripPermitDatePicker fieldName={"permitDate"} />
          </div>
          <div className={"grid-col-6"}>
            <strong>{Config.abcEmergencyTripPermit.fields.permitStartTime}</strong>
            <EmergencyTripPermitTimePicker
              fieldName={"permitStartTime"}
              allDay={
                context.state.applicationInfo.permitDate !==
                getCurrentDateInNewJersey().format(defaultDateFormat)
              }
            />
          </div>
        </div>
        <div className={"padding-top-3"}>
          <Heading level={4}>{Config.abcEmergencyTripPermit.steps.trip.pickupSiteSection}</Heading>
          <EmergencyTripPermitTextFieldEntry fieldName={"pickupSiteName"} maxLength={100} required />
          <EmergencyTripPermitCountryDropdown fieldName={"pickupCountry"} />
          <EmergencyTripPermitTextFieldEntry fieldName={"pickupAddress"} maxLength={35} required />
          <div className={"grid-row grid-gap"}>
            <span className={"grid-col-6"}>
              <EmergencyTripPermitTextFieldEntry fieldName={"pickupCity"} maxLength={35} required />
            </span>
            <EmergencyTripPermitStateDropdown fieldName={"pickupStateProvince"} />
            <span className={"grid-col-4"}>
              <EmergencyTripPermitTextFieldEntry fieldName={"pickupZipPostalCode"} maxLength={10} required />
            </span>
          </div>
        </div>
        <div className={"padding-top-3"}>
          <Heading level={4}>{Config.abcEmergencyTripPermit.steps.trip.deliverySiteSection}</Heading>
          <EmergencyTripPermitTextFieldEntry fieldName={"deliverySiteName"} maxLength={100} required />
          <EmergencyTripPermitCountryDropdown fieldName={"deliveryCountry"} />
          <EmergencyTripPermitTextFieldEntry fieldName={"deliveryAddress"} maxLength={35} required />
          <div className={"grid-row grid-gap"}>
            <span className={"grid-col-6"}>
              <EmergencyTripPermitTextFieldEntry fieldName={"deliveryCity"} maxLength={35} required />
            </span>
            <EmergencyTripPermitStateDropdown fieldName={"deliveryStateProvince"} />
            <span className={"grid-col-4"}>
              <EmergencyTripPermitTextFieldEntry
                fieldName={"deliveryZipPostalCode"}
                maxLength={10}
                required
              />
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};
