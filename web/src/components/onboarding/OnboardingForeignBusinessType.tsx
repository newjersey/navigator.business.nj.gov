import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { profileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { determineForeignBusinessType } from "@/lib/domain-logic/determineForeignBusinessType";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { FormContextFieldProps } from "@/lib/types/types";
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
export const OnboardingForeignBusinessType = <T,>(props: Props<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, Validate } = useFormContextFieldHelpers(
    "foreignBusinessTypeIds",
    profileFormContext,
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
    let ids = state.profileData.foreignBusinessTypeIds;

    if (ids.includes("none") && event.target.value !== "none") {
      ids = [event.target.value];
    } else if (event.target.value === "none" && !ids.includes("none")) {
      ids = ["none"];
    } else {
      ids = event.target.checked
        ? [...ids, event.target.value]
        : ids.filter((it) => {
            return it !== event.target.value;
          });
    }
    isValid(ids) && Validate(false);

    const foreignBusinessType = determineForeignBusinessType(ids);
    setProfileData({
      ...state.profileData,
      industryId: foreignBusinessType === "NEXUS" ? state.profileData.industryId : undefined,
      foreignBusinessType,
      foreignBusinessTypeIds: ids,
    });
  };
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

      {state.profileData.foreignBusinessType !== undefined &&
        state.profileData.foreignBusinessType !== "NONE" && (
          <Alert variant="info">
            <Content key={state.profileData.foreignBusinessType}>
              {contentFromConfig[state.profileData.foreignBusinessType]}
            </Content>
          </Alert>
        )}
    </>
  );
};
