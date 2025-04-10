import { Heading } from "@/components/njwds-extended/Heading";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitCountryDropdown";
import { EmergencyTripPermitStateDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStateDropdown";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTextField";
import { createDataFormErrorMap } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { ReactElement } from "react";

export const RequestorStep = (): ReactElement => {
  const { Config } = useConfig();

  const { onSubmit } = useFormContextHelper(createDataFormErrorMap());

  return (
    <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.requestor.requestorSection}</Heading>
        {Config.abcEmergencyTripPermit.steps.requestor.requestorSectionSubHeading}
      </div>

      <div>
        <EmergencyTripPermitTextFieldEntry fieldName={"carrier"} required />
        <div className={"grid-row grid-gap"}>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorFirstName"} maxLength={35} required />
          </span>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorLastName"} maxLength={35} required />
          </span>
        </div>
        <EmergencyTripPermitTextFieldEntry fieldName={"requestorEmail"} required />
        <EmergencyTripPermitTextFieldEntry fieldName={"requestorPhone"} numeric maxLength={15} required />
        <EmergencyTripPermitCountryDropdown fieldName={"requestorCountry"} />
        <EmergencyTripPermitTextFieldEntry fieldName={"requestorAddress1"} maxLength={35} required />
        <EmergencyTripPermitTextFieldEntry
          fieldName={"requestorAddress2"}
          secondaryLabel={"(Optional)"}
          required={false}
          maxLength={35}
        />
        <div className={"grid-row grid-gap"}>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorCity"} maxLength={35} required />
          </span>
          <EmergencyTripPermitStateDropdown fieldName={"requestorStateProvince"} />
          <span className={"grid-col-4"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"requestorZipPostalCode"} maxLength={10} required />
          </span>
        </div>
        <Heading level={3} className={"padding-top-5 padding-bottom-3"}>
          {Config.abcEmergencyTripPermit.steps.requestor.vehicleSection}
        </Heading>
        <div className={"grid-row grid-gap"}>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleMake"} maxLength={35} required />
          </span>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleYear"} numeric maxLength={4} required />
          </span>
        </div>
        <div className={"grid-row grid-gap"}>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleVinSerial"} maxLength={17} required />
          </span>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"vehicleLicensePlateNum"} maxLength={8} required />
          </span>
        </div>
        <div className={"grid-row grid-gap"}>
          <div className={"grid-col-6 padding-top-1"}>
            <EmergencyTripPermitStateDropdown fieldName={"vehicleStateProvince"} />
          </div>
          <div className={"grid-col-6 padding-top-1"}>
            <EmergencyTripPermitCountryDropdown fieldName={"vehicleCountry"} />
          </div>
        </div>
      </div>
    </form>
  );
};
