import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { determineForeignBusinessType } from "@/lib/domain-logic/determineForeignBusinessType";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import { ChangeEvent, ReactElement, useContext } from "react";

const allForeignBusinessTypeIdsOrdered = [
  "operationsInNJ",
  "employeesInNJ",
  "transactionsInNJ",
  "revenueInNJ",
  "none",
];

export const OnboardingForeignBusinessType = (): ReactElement => {
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
        : ids.filter((it) => {
            return it !== event.target.value;
          });
    }

    const foreignBusinessType = determineForeignBusinessType(ids);

    setProfileData({
      ...state.profileData,
      foreignBusinessType,
      foreignBusinessTypeIds: ids,
    });
  };

  return (
    <>
      <div className="margin-top-3">
        <FormControl variant="outlined" fullWidth aria-label="Out of state business">
          {allForeignBusinessTypeIdsOrdered.map((id: string) => {
            return (
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
                        Config.profileDefaults.FOREIGN.foreignBusinessTypeIds.optionContent as Record<
                          string,
                          string
                        >
                      )[id]
                    }
                  </Content>
                }
              />
            );
          })}
        </FormControl>
      </div>

      {state.profileData.foreignBusinessType !== undefined &&
        state.profileData.foreignBusinessType !== "NONE" && (
          <Alert variant="info">
            <Content key={state.profileData.foreignBusinessType}>
              {Config.profileDefaults.FOREIGN.foreignBusinessTypeIds[state.profileData.foreignBusinessType]}
            </Content>
          </Alert>
        )}
    </>
  );
};
