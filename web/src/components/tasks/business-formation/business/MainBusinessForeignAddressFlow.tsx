import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { MainBusinessIntl } from "@/components/tasks/business-formation/business/MainBusinessAddressIntl";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
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
  type FlowBusinessLocationType = Exclude<FormationBusinessLocationType, "NJ">;
  const { Config } = useConfig();
  const { state, setFieldsInteracted, setFormationFormData } = useContext(BusinessFormationContext);

  useMountEffect(() => {
    if (state.formationFormData.businessLocationType === "US") {
      setFormationFormData((previousState) => {
        return {
          ...previousState,
          addressCountry: "US",
        };
      });
    }
  });

  const onChange = (value: FlowBusinessLocationType): void => {
    let resetAddress = createEmptyFormationAddress();
    setFieldsInteracted(Object.keys(createEmptyFormationAddress()) as (keyof FormationAddress)[], {
      setToUninteracted: true,
    });

    if (value === "US") {
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
      <h3 className="margin-bottom-3" data-testid="main-business-address-container-header">
        {Config.formation.sections.addressHeader}
      </h3>
      <CannabisLocationAlert />
      <FormControl variant="outlined" fullWidth className="padding-bottom-2">
        <RadioGroup
          aria-label={"Foreign address type"}
          key={`${state.formationFormData.businessLocationType}-key`}
          value={state.formationFormData.businessLocationType}
          onChange={(event): void => onChange(event.target.value as FlowBusinessLocationType)}
          row
        >
          <>
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid={"address-radio-us"}
              value={"US"}
              control={<Radio color="primary" />}
              label={"US address"}
            />
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid={"address-radio-intl"}
              value={"INTL"}
              control={<Radio color="primary" />}
              label={"International address"}
            />
          </>
        </RadioGroup>
      </FormControl>
      {state.formationFormData.businessLocationType === "US" ? <MainBusinessUs /> : <MainBusinessIntl />}
    </>
  );
};
