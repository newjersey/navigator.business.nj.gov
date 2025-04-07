import { StateDropdown } from "@/components/StateDropdown";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitCountryDropdown";
import { generateEmptyErrorMap } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStepsConfiguration";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTextField";
import { RequestorTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/steps/requestor/RequestorTextFieldEntry";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { createDataFormErrorMap } from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useContext } from "react";

export const RequestorStep = (): ReactElement => {
  const context = useContext(EmergencyTripPermitContext);
  const errorMap: Record<EmergencyTripPermitFieldNames, boolean> = generateEmptyErrorMap();

  const { onSubmit } = useFormContextHelper(createDataFormErrorMap());

  return (
    <>
      <form onSubmit={onSubmit} className={`usa-prose onboarding-form margin-top-2`}>
        <RequestorTextFieldEntry
          fieldName={"carrier"}
          label={"Carrier Name (Business Name)"}
          errorMap={errorMap}
        />
        <div>
          <div>
            <EmergencyTripPermitTextFieldEntry
              fieldName={"requestorFirstName"}
              label={"Requestor First Name"}
              hasError={errorMap["requestorFirstName"]}
            />
            <EmergencyTripPermitTextFieldEntry
              fieldName={"requestorLastName"}
              label={"Requestor Last Name"}
              hasError={errorMap["requestorLastName"]}
            />
          </div>
          <EmergencyTripPermitTextFieldEntry
            fieldName={"requestorEmail"}
            label={"Email Address"}
            hasError={errorMap["requestorEmail"]}
          />
          <EmergencyTripPermitTextFieldEntry
            fieldName={"requestorPhone"}
            label={"Phone Number"}
            hasError={errorMap["requestorPhone"]}
          />
          <EmergencyTripPermitCountryDropdown
            fieldName={"requestorCountry"}
            value={context.state.applicationInfo.requestorCountry}
            label={"Country"}
            onSelect={(country) => {
              context.setApplicationInfo({
                ...context.state.applicationInfo,
                requestorCountry: country?.shortCode ?? "US",
              });
            }}
          />
          <EmergencyTripPermitTextFieldEntry
            fieldName={"requestorAddress1"}
            label={"Business Address Line 1"}
            hasError={errorMap["requestorAddress1"]}
          />
          <EmergencyTripPermitTextFieldEntry
            fieldName={"requestorAddress2"}
            label={"Business Address Line 2 (Optional)"}
            hasError={errorMap["requestorAddress2"]}
          />
          <EmergencyTripPermitTextFieldEntry
            fieldName={"requestorCity"}
            label={"City"}
            hasError={errorMap["requestorCity"]}
          />
          <StateDropdown
            fieldName={"requestorState"}
            onSelect={(state) => {
              if (state && state.shortCode !== "Outside of the USA") {
                context.setApplicationInfo({
                  ...context.state.applicationInfo,
                  requestorStateProvince: state?.shortCode,
                });
              }
            }}
            value={context.state.applicationInfo.requestorStateProvince}
          />
          <EmergencyTripPermitTextFieldEntry
            fieldName={"requestorZipPostalCode"}
            label={"Zip Code"}
            hasError={errorMap["requestorZipPostalCode"]}
          />
        </div>
      </form>
    </>
  );
};
