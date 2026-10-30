import type {
  CountriesObject,
  EmergencyTripPermitUserEnteredFieldNames,
} from "@businessnjgovnavigator/shared";
import { type ReactElement, useContext } from "react";
import { CountryDropdown } from "@/components/CountryDropdown";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";

interface Props {
  fieldName: EmergencyTripPermitUserEnteredFieldNames;
}

export const EmergencyTripPermitCountryDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const unitedStatesObject: CountriesObject = { shortCode: "US", name: "United States" };
  const options = [unitedStatesObject];
  const fieldNameLabels = Config.abcEmergencyTripPermit.fields;
  return (
    <div className={"padding-top-1"}>
      {/* biome-ignore lint/a11y/noLabelWithoutControl: the label wraps the <input> that CountryDropdown renders */}
      <label>
        <span className={"text-bold"}>{fieldNameLabels[props.fieldName]}</span>
        <CountryDropdown
          useFullName
          fieldName={props.fieldName}
          value={context.state.applicationInfo[props.fieldName]}
          onSelect={(country) => {
            if (country) {
              context.setApplicationInfo({
                ...context.state.applicationInfo,
                [props.fieldName]: country.shortCode,
              });
            }
          }}
          options={options}
          disabled
        />
      </label>
    </div>
  );
};
