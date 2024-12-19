import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
import { determineForeignBusinessType } from "@businessnjgovnavigator/shared";
import { ForeignBusinessTypeId } from "@businessnjgovnavigator/shared/";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { ChangeEvent, ReactElement, useContext } from "react";

const allForeignBusinessTypeIdsOrdered = [
  "employeeOrContractorInNJ",
  "officeInNJ",
  "propertyInNJ",
  "companyOperatedVehiclesInNJ",
  "employeesInNJ",
  "transactionsInNJ",
  "revenueInNJ",
  "none",
] as const;

interface Props<T> extends FormContextFieldProps<T> {
  required?: boolean;
}
export const ForeignBusinessTypeField = <T,>(props: Props<T>): ReactElement<any> => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, setIsValid } = useFormContextFieldHelpers(
    "foreignBusinessTypeIds",
    ProfileFormContext,
    props.errorTypes
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["foreignBusinessTypeIds"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "foreignBusinessTypeIds",
    });

  const isValid = (ids: string[]): boolean => ids.length > 0;

  RegisterForOnSubmit(() => isValid(state.profileData.foreignBusinessTypeIds));

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value as ForeignBusinessTypeId;
    let ids = state.profileData.foreignBusinessTypeIds;

    if (ids.includes("none") && value !== "none") {
      ids = [value];
    } else if (value === "none" && !ids.includes("none")) {
      ids = ["none"];
    } else {
      ids = event.target.checked
        ? [...ids, value]
        : ids.filter((it) => {
            return it !== value;
          });
    }
    isValid(ids) && setIsValid(true);

    setProfileData({
      ...state.profileData,
      industryId: determineForeignBusinessType(ids) === "NEXUS" ? state.profileData.industryId : undefined,
      homeBasedBusiness: ids.includes("officeInNJ") ? false : state.profileData.homeBasedBusiness,
      foreignBusinessTypeIds: ids,
    });
  };

  let renderAlertForValidForeignBusiness = determineForeignBusinessType(
    state.profileData.foreignBusinessTypeIds
  );

  if (
    determineForeignBusinessType(state.profileData.foreignBusinessTypeIds) === undefined ||
    renderAlertForValidForeignBusiness === "NONE"
  ) {
    renderAlertForValidForeignBusiness = undefined;
  }

  return (
    <>
      <div className="margin-top-3">
        <FormControl variant="outlined" fullWidth aria-label="Out of state business">
          {(
            allForeignBusinessTypeIdsOrdered as unknown as (typeof allForeignBusinessTypeIdsOrdered)[number][]
          )
            .filter((id) => (props.required ? id !== "none" : true))
            .map((id) => {
              return (
                <FormControlLabel
                  key={id}
                  control={
                    <Checkbox
                      name="foreign-business-type"
                      value={id}
                      onChange={handleChange}
                      checked={state.profileData.foreignBusinessTypeIds.includes(id)}
                    />
                  }
                  label={<Content>{(contentFromConfig.optionContent as Record<string, string>)[id]}</Content>}
                />
              );
            })}
        </FormControl>
      </div>

      {!!renderAlertForValidForeignBusiness && (
        <Alert variant="info">
          <Content key={determineForeignBusinessType(state.profileData.foreignBusinessTypeIds)}>
            {contentFromConfig[renderAlertForValidForeignBusiness]}
          </Content>
        </Alert>
      )}
    </>
  );
};
