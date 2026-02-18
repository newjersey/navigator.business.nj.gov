import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { determineForeignBusinessType } from "@businessnjgovnavigator/shared";
import { ForeignBusinessTypeId } from "@businessnjgovnavigator/shared/";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { FormContextFieldProps } from "@businessnjgovnavigator/shared/types";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { ChangeEvent, ReactElement, useContext, useRef, useEffect } from "react";
import { flushSync } from "react-dom";

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
export const ForeignBusinessTypeField = <T,>(props: Props<T>): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const { RegisterForOnSubmit, setIsValid } = useFormContextFieldHelpers(
    "foreignBusinessTypeIds",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["foreignBusinessTypeIds"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "foreignBusinessTypeIds",
    });

  const isValid = (ids: string[]): boolean => ids.length > 0;

  // React 19: Use ref to track latest value for validation
  // This prevents stale closure issues when form validates before context updates
  const foreignBusinessTypeIdsRef = useRef(state.profileData.foreignBusinessTypeIds);

  useEffect(() => {
    foreignBusinessTypeIdsRef.current = state.profileData.foreignBusinessTypeIds;
  }, [state.profileData.foreignBusinessTypeIds]);

  // React 19: The ref is only accessed when the validation callback runs (on submit), not during render
  // eslint-disable-next-line react-hooks/refs
  RegisterForOnSubmit(() => isValid(foreignBusinessTypeIdsRef.current));

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

    // React 19: Update ref immediately so validation always sees latest value
    foreignBusinessTypeIdsRef.current = ids;
    isValid(ids) && setIsValid(true);

    // React 19: Use flushSync to ensure state update completes immediately
    // This prevents race conditions where form submission happens before state is updated
    flushSync(() => {
      setProfileData({
        ...state.profileData,
        industryId:
          determineForeignBusinessType(ids) === "NEXUS" ? state.profileData.industryId : undefined,
        homeBasedBusiness: ids.includes("officeInNJ") ? false : state.profileData.homeBasedBusiness,
        foreignBusinessTypeIds: ids,
      });
    });
  };

  let renderAlertForValidForeignBusiness = determineForeignBusinessType(
    state.profileData.foreignBusinessTypeIds,
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
                  label={
                    <Content>
                      {(contentFromConfig.optionContent as Record<string, string>)[id]}
                    </Content>
                  }
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
