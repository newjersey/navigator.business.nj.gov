import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { determineForeignBusinessType } from "@/lib/domain-logic/determineForeignBusinessType";
import { setHeaderRole } from "@/lib/utils/helpers";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { ChangeEvent, ReactElement, useContext } from "react";

interface Props {
  headerAriaLevel?: number;
}

const allForeignBusinessTypeIds = ["employeesInNJ", "transactionsInNJ", "revenueInNJ", "none"];

export const OnboardingForeignBusinessType = ({ headerAriaLevel = 2 }: Props): ReactElement => {
  const { state, setProfileData } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    let ids = state.profileData.foreignBusinessTypeIds;

    if (ids.includes("none") && event.target.value !== "none") {
      ids = [event.target.value];
    } else if (event.target.value === "none" && !ids.includes("none")) {
      ids = ["none"];
    } else {
      ids = event.target.checked
        ? [...ids, event.target.value]
        : ids.filter((it) => it !== event.target.value);
    }

    const foreignBusinessType = determineForeignBusinessType(ids);

    setProfileData({
      ...state.profileData,
      foreignBusinessType,
      foreignBusinessTypeIds: ids,
    });
  };
  const headerLevelTwo = setHeaderRole(headerAriaLevel, "h3-styling");

  return (
    <>
      <Content overrides={{ h2: headerLevelTwo }}>
        {Config.profileDefaults[state.flow].foreignBusinessType.header}
      </Content>
      <Content overrides={{ h2: headerLevelTwo }}>
        {Config.profileDefaults[state.flow].foreignBusinessType.description}
      </Content>
      <div className="margin-top-3">
        <FormControl variant="outlined" fullWidth aria-label="Out of state business">
          {allForeignBusinessTypeIds.map((id: string) => (
            <FormControlLabel
              key={id}
              style={{ alignItems: "flex-start" }}
              className="padding-y-1"
              control={
                <div style={{ display: "table-cell", width: "42px" }}>
                  <Checkbox
                    name="foreign-business-type"
                    value={id}
                    style={{ paddingTop: 0, paddingBottom: 0 }}
                    onChange={handleChange}
                    checked={state.profileData.foreignBusinessTypeIds.includes(id)}
                  />
                </div>
              }
              label={
                <Content>
                  {
                    (
                      Config.profileDefaults.FOREIGN.foreignBusinessType.optionContent as Record<
                        string,
                        string
                      >
                    )[id]
                  }
                </Content>
              }
            />
          ))}
        </FormControl>
      </div>

      {state.profileData.foreignBusinessType !== undefined &&
        state.profileData.foreignBusinessType !== "NONE" && (
          <Alert variant="info">
            <Content>
              {Config.profileDefaults.FOREIGN.foreignBusinessType[state.profileData.foreignBusinessType]}
            </Content>
          </Alert>
        )}
    </>
  );
};
