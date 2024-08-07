import { HorizontalLine } from "@/components/HorizontalLine";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { AnytimeActionLicenseReinstatement, AnytimeActionLink, AnytimeActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { Autocomplete, TextField, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ChangeEvent, ReactElement, useState } from "react";

interface Props {
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionLinks: AnytimeActionLink[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
}

type AnytimeAction = AnytimeActionTask | AnytimeActionLink | AnytimeActionLicenseReinstatement;
type AnytimeActionWithType = AnytimeAction & { type: string };

export const AnytimeActionDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [selectedAnytimeAction, setSelectedAnytimeAction] = useState<AnytimeActionWithType | undefined>(
    undefined
  );
  const router = useRouter();
  const { business } = useUserData();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const industryId = business?.profileData.industryId;
  const sectorId = business?.profileData.sectorId;

  const findMatch = (action: AnytimeActionTask | AnytimeActionLink): boolean => {
    if (action.applyToAllUsers) return true;
    if (action.industryIds && industryId && action.industryIds.includes(industryId)) return true;
    return !!(action.sectorIds && sectorId && action.sectorIds.includes(sectorId));
  };

  const licenseReinstatementMatch = (action: AnytimeActionLicenseReinstatement): boolean => {
    return !!(
      action.industryIds &&
      industryId &&
      action.industryIds.includes(industryId) &&
      business.licenseData?.status === "EXPIRED"
    );
  };

  const anytimeActionLinkWithType = props.anytimeActionLinks
    .filter((action) => findMatch(action))
    .map((action) => {
      return { ...action, type: "link" };
    });
  const anytimeActionTaskWithType = props.anytimeActionTasks
    .filter((action) => findMatch(action))
    .map((action) => {
      return { ...action, type: "task" };
    });
  const anytimeActionLicenseReinstatementsWithType = props.anytimeActionLicenseReinstatements
    .filter((action) => licenseReinstatementMatch(action))
    .map((action) => {
      return { ...action, type: "license" };
    });

  const allAnytimeActions: AnytimeActionWithType[] = [];
  allAnytimeActions.push(...anytimeActionLinkWithType);
  allAnytimeActions.push(...anytimeActionTaskWithType);
  allAnytimeActions.push(...anytimeActionLicenseReinstatementsWithType);
  allAnytimeActions.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    } else return -1;
  });

  const handleChange = (event: ChangeEvent<unknown>, value: AnytimeActionWithType | null): void => {
    if (value === null) {
      setSelectedAnytimeAction(undefined);
    } else {
      setSelectedAnytimeAction(value);
    }
  };

  return (
    <div className={"anytime-action-dropdown-container"}>
      <Heading level={2} className={"h2-styling text-medium"}>
        {Config.dashboardAnytimeActionDefaults.defaultHeaderText}
      </Heading>
      <HorizontalLine ariaHidden={true} />
      <span className={"text-bold"}>
        {Config.dashboardAnytimeActionDefaults.defaultAutocompleteHeaderText}
      </span>
      <span className={isDesktopAndUp ? "flex" : "flex-column"}>
        <Autocomplete
          renderInput={(params): JSX.Element => {
            return (
              <TextField
                {...params}
                inputProps={{
                  "aria-label": "anytimeActionDropdown",
                  "data-testid": "anytimeActionDropdown",
                  className: "",
                  ...params.inputProps,
                }}
                variant="outlined"
              />
            );
          }}
          getOptionLabel={(option: AnytimeActionWithType) => {
            return option.name;
          }}
          isOptionEqualToValue={(option, value) => {
            return option.name === value.name && option.filename === value.filename;
          }}
          options={allAnytimeActions}
          renderOption={(_props, option: AnytimeActionWithType, { selected }): JSX.Element => {
            return (
              <li {..._props} key={option.filename}>
                {selected ? (
                  <MenuOptionSelected>{option.name}</MenuOptionSelected>
                ) : (
                  <MenuOptionUnselected>{option.name}</MenuOptionUnselected>
                )}
              </li>
            );
          }}
          onChange={handleChange}
          className={
            selectedAnytimeAction
              ? `fg1 anytime-action-dropdown ${!isDesktopAndUp && "margin-bottom-1"}`
              : " anytime-action-dropdown width-100"
          }
        />
        {selectedAnytimeAction && (
          <span
            className={
              isDesktopAndUp ? "anytime-action-primary-button" : "anytime-action-primary-button-mobile"
            }
          >
            {" "}
            <PrimaryButton
              isColor={"primary"}
              dataTestId={"anytimeActionPrimaryButton"}
              onClick={() => {
                analytics.event.anytime_action_button.click.go_to_anytime_action_screen(
                  selectedAnytimeAction.filename
                );
                if (selectedAnytimeAction.type === "task") {
                  router.push(
                    `${ROUTES.anytimeActions}/${(selectedAnytimeAction as AnytimeActionTask).urlSlug}`
                  );
                }
                if (selectedAnytimeAction.type === "license") {
                  router.push(
                    `${ROUTES.licenseReinstatement}/${
                      (selectedAnytimeAction as AnytimeActionLicenseReinstatement).urlSlug
                    }`
                  );
                }
                if (selectedAnytimeAction?.type === "link") {
                  router.push((selectedAnytimeAction as AnytimeActionLink).externalRoute);
                }
              }}
            >
              {Config.dashboardAnytimeActionDefaults.anytimeActionPageButtonText}
            </PrimaryButton>
          </span>
        )}
      </span>
    </div>
  );
};
