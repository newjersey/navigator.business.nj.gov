import { Heading } from "@/components/njwds-extended/Heading";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitCountryDropdown";
import { EmergencyTripPermitDatePicker } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitDatePicker";
import { EmergencyTripPermitStateDropdown } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitStateDropdown";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTextField";
import { EmergencyTripPermitTimePicker } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTimePicker";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

export const TripStep = (): ReactElement => {
  const { Config } = useConfig();
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  return (
    <form className={`usa-prose onboarding-form margin-top-2`}>
      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.trip.subHeader}</Heading>
      </div>
      <div>
        <div className={"grid-row grid-gap padding-bottom-1"}>
          <div className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <strong>{Config.abcEmergencyTripPermit.fields.permitDate}</strong>
            <EmergencyTripPermitDatePicker fieldName={"permitDate"} />
          </div>
          <div className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTimePicker fieldName={"permitStartTime"} />
          </div>
        </div>
        <div className={"padding-top-3"}>
          <Heading level={4}>{Config.abcEmergencyTripPermit.steps.trip.pickupSiteSection}</Heading>
          <EmergencyTripPermitTextFieldEntry fieldName={"pickupSiteName"} required />
          <EmergencyTripPermitCountryDropdown fieldName={"pickupCountry"} />
          <EmergencyTripPermitTextFieldEntry fieldName={"pickupAddress"} required />
          <div className={"grid-row grid-gap"}>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              <EmergencyTripPermitTextFieldEntry fieldName={"pickupCity"} required />
            </span>
            <EmergencyTripPermitStateDropdown
              className={isMobile ? "grid-col-6" : ""}
              fieldName={"pickupStateProvince"}
            />
            <span className={`${isMobile ? "grid-col-6" : "grid-col-4"}`}>
              <EmergencyTripPermitTextFieldEntry fieldName={"pickupZipPostalCode"} required />
            </span>
          </div>
        </div>
        <div className={"padding-top-3"}>
          <Heading level={4}>{Config.abcEmergencyTripPermit.steps.trip.deliverySiteSection}</Heading>
          <EmergencyTripPermitTextFieldEntry fieldName={"deliverySiteName"} required />
          <EmergencyTripPermitCountryDropdown fieldName={"deliveryCountry"} />
          <EmergencyTripPermitTextFieldEntry fieldName={"deliveryAddress"} required />
          <div className={"grid-row grid-gap"}>
            <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
              <EmergencyTripPermitTextFieldEntry fieldName={"deliveryCity"} required />
            </span>
            <EmergencyTripPermitStateDropdown
              className={isMobile ? "grid-col-6" : ""}
              fieldName={"deliveryStateProvince"}
            />
            <span className={`${isMobile ? "grid-col-6" : "grid-col-4"}`}>
              <EmergencyTripPermitTextFieldEntry fieldName={"deliveryZipPostalCode"} required />
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};
