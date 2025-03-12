import { CountryDropdown } from "@/components/CountryDropdown";
import { CountriesObject } from "@businessnjgovnavigator/shared/countries";
import { ReactElement } from "react";

interface Props {
  value: string;
  fieldName: string;
  onSelect: (country: CountriesObject | undefined) => void;
  label: string;
}

export const EmergencyTripPermitCountryDropdown = (props: Props): ReactElement => {
  const unitedStatesObject: CountriesObject = { shortCode: "US", name: "United States" };
  const options = [unitedStatesObject];
  return (
    <>
      <strong>{props.label}</strong>
      <CountryDropdown
        useFullName
        fieldName={props.fieldName}
        value={props.value}
        error={false}
        validationText={""}
        onSelect={props.onSelect}
        options={options}
      />
    </>
  );
};
