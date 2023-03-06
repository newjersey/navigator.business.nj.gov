import { MainBusinessIntl } from "@/components/tasks/business-formation/business/MainBusinessAddressIntl";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useMountEffect } from "@/lib/utils/helpers";
import {
  createEmptyFormationAddress,
  FormationAddress,
  FormationBusinessLocationType,
} from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";
import { MainBusinessUs } from "./MainBusinessAddressUs";

export const MainBusinessForeignAddressFlow = (): ReactElement => {
  const { state, setFieldsInteracted, setFormationFormData } = useContext(BusinessFormationContext);
  type FlowBusinessLocationType = Exclude<FormationBusinessLocationType, "NJ">;

  useMountEffect(() => {
    if (state.formationFormData.businessLocationType == "US") {
      setFormationFormData((previousState) => {
        return {
          ...previousState,
          addressCountry: "US",
        };
      });
    }
  });

  const onChange = (value: FlowBusinessLocationType) => {
    let resetAddress = createEmptyFormationAddress();
    setFieldsInteracted(Object.keys(createEmptyFormationAddress()) as (keyof FormationAddress)[], {
      setToUninteracted: true,
    });

    if (value == "US") {
      resetAddress = { ...resetAddress, addressCountry: "US" };
    }

    setFormationFormData((previousState) => {
      return {
        ...previousState,
        ...resetAddress,
        businessLocationType: value,
      };
    });
  };

  return (
    <>
      <FormControl variant="outlined" fullWidth className="padding-bottom-2">
        <RadioGroup
          aria-label={"Foreign address type"}
          key={`${state.formationFormData.businessLocationType}-key`}
          value={state.formationFormData.businessLocationType}
          onChange={(event) => onChange(event.target.value as FlowBusinessLocationType)}
          row
        >
          <>
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid={"address-radio-us"}
              value={"US"}
              control={<Radio color="primary" />}
              label={<div className="padding-y-1 margin-right-3">{"US address"}</div>}
            />
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid={"address-radio-intl"}
              value={"INTL"}
              control={<Radio color="primary" />}
              label={<div className="padding-y-1 margin-right-3">{"International address"}</div>}
            />
          </>
        </RadioGroup>
      </FormControl>
      {state.formationFormData.businessLocationType == "US" ? <MainBusinessUs /> : <MainBusinessIntl />}
    </>
  );
};
