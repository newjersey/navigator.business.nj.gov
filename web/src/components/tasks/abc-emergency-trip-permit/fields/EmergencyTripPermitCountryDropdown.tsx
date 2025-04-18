import { CountryDropdown } from "@/components/CountryDropdown";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { CountriesObject } from "@businessnjgovnavigator/shared/countries";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: EmergencyTripPermitFieldNames;
}

export const EmergencyTripPermitCountryDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const unitedStatesObject: CountriesObject = { shortCode: "US", name: "United States" };
  const options = [unitedStatesObject];
  const fieldNameLabels = Config.abcEmergencyTripPermit.fields as Record<
    EmergencyTripPermitFieldNames,
    string
  >;
  return (
    <div className={"padding-top-1"}>
      <strong>{fieldNameLabels[props.fieldName]}</strong>
      <CountryDropdown
        useFullName
        fieldName={props.fieldName}
        value={context.state.applicationInfo[props.fieldName]}
        error={false}
        validationText={""}
        onSelect={(country) => {
          context.setApplicationInfo({
            ...context.state.applicationInfo,
            [props.fieldName]: country?.shortCode ?? "US",
          });
        }}
        options={options}
      />
    </div>
  );
};
