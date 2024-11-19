import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { Heading } from "@/components/njwds-extended/Heading";
import { MainBusinessAddressIntl } from "@/components/tasks/business-formation/business/MainBusinessAddressIntl";
import { MainBusinessAddressUs } from "@/components/tasks/business-formation/business/MainBusinessAddressUs";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffect } from "@/lib/utils/helpers";
import {
  createEmptyFormationAddress,
  FormationAddress,
  FormationBusinessLocationType,
} from "@businessnjgovnavigator/shared/";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { ReactElement, useContext } from "react";

export const MainBusinessForeignAddressFlow = (): ReactElement => {
  type FlowBusinessLocationType = Exclude<FormationBusinessLocationType, "NJ">;
  const { Config } = useConfig();
  const { state, setFieldsInteracted, setFormationFormData } = useContext(BusinessFormationContext);
  const { business } = useUserData();

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

  // useMountEffect(() => {
  //   if (state.formationFormData.businessLocationType === "US" ||state.formationFormData.businessLocationType === "INTL") {
  //     setFormationFormData((previousState) => {
  //       return {
  //         ...previousState,
  //         addressCountry: previousState.addressCountry,
  //       };
  //     });
  //   }
  // });

  console.log(
    "state.formationFormData.businessLocationType outside Mount",
    state.formationFormData.businessLocationType
  );
  console.log("useUserData", useUserData());
  console.log("business", business);
  console.log("biz...", business?.formationData.formationFormData.businessLocationType);
  // useMountEffect(() => {
  //   // if (state.formationFormData.businessLocationType === "US") {
  //   console.log("state biz type", state.formationFormData.businessLocationType);
  //   const persistedLocation = business?.formationData.formationFormData.businessLocationType;
  //   console.log("persistedLocation", persistedLocation);

  //   if (!state.formationFormData.businessLocationType) {
  //     const defaultLocation = persistedLocation || "US";
  //     console.log("defaultLocation", defaultLocation);
  //     setFormationFormData((previousState) => {
  //       console.log("previousState", previousState);
  //       const updatedState = {
  //         ...previousState,
  //         businessLocationType: defaultLocation,
  //         addressCountry: defaultLocation === "US" ? "US" : previousState.addressCountry,
  //       };
  //       // return {
  //       //   ...previousState,
  //       //   businessLocationType: defaultLocation,
  //       //   addressCountry: defaultLocation === "US" ? "US" : previousState.addressCountry,
  //       // };
  //       console.log("updatedstate", updatedState);
  //       return updatedState;
  //     });
  //   }
  //   console.log("updated bizlocation", state.formationFormData.businessLocationType);
  // });
  console.log("business in MainBiz", business);

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
      <Heading level={3} className="margin-bottom-3" data-testid="main-business-address-container-header">
        {Config.formation.sections.addressHeader}
      </Heading>
      <CannabisLocationAlert industryId={business?.profileData.industryId} />
      <FormControl variant="outlined" fullWidth className="padding-bottom-2">
        <RadioGroup
          aria-label={"Foreign address type"}
          key={`${state.formationFormData.businessLocationType}-key`}
          value={state.formationFormData.businessLocationType}
          onChange={(event): void => onChange(event.target.value as FlowBusinessLocationType)}
          row
        >
          {/* {console.log(state.formationFormData.businessLocationType)} */}
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
      {state.formationFormData.businessLocationType === "US" ? (
        <MainBusinessAddressUs />
      ) : (
        <MainBusinessAddressIntl />
      )}
    </>
  );
};
