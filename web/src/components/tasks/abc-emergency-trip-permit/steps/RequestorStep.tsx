import { Heading } from "@/components/njwds-extended/Heading";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitCountryDropdown";
import { EmergencyTripPermitStateDropdown } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitStateDropdown";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTextField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const RequestorStep = (): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  return (
    <form onSubmit={context.onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.requestor.requestorSection}</Heading>
        {Config.abcEmergencyTripPermit.steps.requestor.requestorSectionSubHeading}
      </div>

      <div>
        <EmergencyTripPermitTextFieldEntry fieldName={"carrier"} required />
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorFirstName"} maxLength={35} required />
          </span>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorLastName"} maxLength={35} required />
          </span>
        </div>
        <EmergencyTripPermitTextFieldEntry fieldName={"requestorEmail"} maxLength={60} required />
        <EmergencyTripPermitTextFieldEntry fieldName={"requestorPhone"} maxLength={15} required />
        <EmergencyTripPermitCountryDropdown fieldName={"requestorCountry"} />
        <EmergencyTripPermitTextFieldEntry fieldName={"requestorAddress1"} maxLength={35} required />
        <EmergencyTripPermitTextFieldEntry
          fieldName={"requestorAddress2"}
          secondaryLabel={"(Optional)"}
          required={false}
          maxLength={35}
        />
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorCity"} maxLength={35} required />
          </span>
          <EmergencyTripPermitStateDropdown
            className={`${isMobile ? "grid-col-6" : ""}`}
            fieldName={"requestorStateProvince"}
          />
          <span className={`${isMobile ? "grid-col-6" : "grid-col-4"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorZipPostalCode"} maxLength={10} required />
          </span>
        </div>
        <Heading level={3} className={"padding-top-5 padding-bottom-3"}>
          {Config.abcEmergencyTripPermit.steps.requestor.vehicleSection}
        </Heading>
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleMake"} maxLength={35} required />
          </span>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleYear"} numeric maxLength={4} required />
          </span>
        </div>
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleVinSerial"} maxLength={17} required />
          </span>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleLicensePlateNum"} maxLength={8} required />
          </span>
        </div>
        <div className={"grid-row grid-gap"}>
          <div className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitStateDropdown fieldName={"vehicleStateProvince"} />
          </div>
          <div className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitCountryDropdown fieldName={"vehicleCountry"} />
          </div>
        </div>
      </div>
    </form>
  );
};
