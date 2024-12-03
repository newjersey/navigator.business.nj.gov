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
import { ChangeEvent, type ReactElement, useState } from "react";

interface Props {
  anytimeActionLicensesTasks: AnytimeActionTask[];
  anytimeActionAdminTasks: AnytimeActionTask[];
  anytimeActionReinstatementsTasks: AnytimeActionTask[];
  anytimeActionLinks: AnytimeActionLink[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
}

type AnytimeAction = AnytimeActionTask | AnytimeActionLink | AnytimeActionLicenseReinstatement;
type AnytimeActionWithTypeAndCategory = AnytimeAction & { type: string; category: string };

export const AnytimeActionDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [selectedAnytimeAction, setSelectedAnytimeAction] = useState<
    AnytimeActionWithTypeAndCategory | undefined
  >(undefined);
  const router = useRouter();
  const { business } = useUserData();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const industryId = business?.profileData.industryId;
  const sectorId = business?.profileData.sectorId;

  const alphabetizeByName = (
    anytimeActions: AnytimeActionWithTypeAndCategory[]
  ): AnytimeActionWithTypeAndCategory[] => {
    return anytimeActions.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  };

  const reverseAlphabetizeByCategory = (
    anytimeActions: AnytimeActionWithTypeAndCategory[]
  ): AnytimeActionWithTypeAndCategory[] => {
    return anytimeActions.sort((a, b) => {
      if (a.category < b.category) {
        return 1;
      }
      if (a.category > b.category) {
        return -1;
      }
      return 0;
    });
  };

  const getApplicableAnytimeActions = (): AnytimeActionWithTypeAndCategory[] => {
    const anytimeActionLinkWithType = props.anytimeActionLinks
      .filter((action) => findMatch(action))
      .map((action) => {
        return {
          ...action,
          type: "link",
          category: Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryAdmin,
        };
      });

    const anytimeActionAdminTaskWithType = props.anytimeActionAdminTasks
      .filter((action) => findMatch(action))
      .map((action) => {
        return {
          ...action,
          type: "task",
          category: Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryAdmin,
        };
      });

    const anytimeActionAdminOrLink = [...anytimeActionLinkWithType, ...anytimeActionAdminTaskWithType];
    alphabetizeByName(anytimeActionAdminOrLink);

    const anytimeActionLicensesTaskWithType = props.anytimeActionLicensesTasks
      .filter((action) => findMatch(action))
      .map((action) => {
        return {
          ...action,
          type: "task",
          category: Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryLicenses,
        };
      });

    alphabetizeByName(anytimeActionLicensesTaskWithType);

    const anytimeActionLicenseReinstatementsWithType = props.anytimeActionLicenseReinstatements
      .filter((action) => licenseReinstatementMatch(action))
      .map((action) => {
        return {
          ...action,
          type: "license-reinstatement",
          category: Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryReinstatements,
        };
      });

    const anytimeActionReinstatementsWithType = props.anytimeActionReinstatementsTasks
      .filter((action) => findMatch(action))
      .map((action) => {
        return {
          ...action,
          type: "task",
          category: Config.dashboardAnytimeActionDefaults.anytimeActionDropdownCategoryReinstatements,
        };
      });

    const anytimeActionAllReinstatments = [
      ...anytimeActionReinstatementsWithType,
      ...anytimeActionLicenseReinstatementsWithType,
    ];

    alphabetizeByName(anytimeActionAllReinstatments);

    const applicableAnytimeActions: AnytimeActionWithTypeAndCategory[] = [];

    applicableAnytimeActions.push(...anytimeActionLicensesTaskWithType);
    applicableAnytimeActions.push(...anytimeActionAdminOrLink);
    applicableAnytimeActions.push(...anytimeActionAllReinstatments);

    reverseAlphabetizeByCategory(applicableAnytimeActions);

    return applicableAnytimeActions;
  };

  const findMatch = (action: AnytimeActionTask | AnytimeActionLink): boolean => {
    if (action.applyToAllUsers) return true;
    if (action.industryIds && industryId && action.industryIds.includes(industryId)) return true;
    if (isAnytimeActionFromNonEssentialQuestions(action)) return true;

    return !!(action.sectorIds && sectorId && action.sectorIds.includes(sectorId));
  };

  const isAnytimeActionFromNonEssentialQuestions = (
    action: AnytimeActionTask | AnytimeActionLink
  ): boolean => {
    switch (action.filename) {
      case "carnival-ride-supplemental-modification":
        return !!business?.profileData.carnivalRideOwningBusiness;
      case "operating-carnival-fire-permit":
        return (
          !!business?.profileData.carnivalRideOwningBusiness ||
          !!business?.profileData.travelingCircusOrCarnivalOwningBusiness
        );
      case "vacant-building-fire-permit":
        return !!business?.profileData.vacantPropertyOwner;
      default:
        return false;
    }
  };

  const licenseReinstatementMatch = (action: AnytimeActionLicenseReinstatement): boolean => {
    const licenseNameFromAnytimeAction = action.licenseName;
    const licenseStatus = business?.licenseData?.licenses?.[licenseNameFromAnytimeAction]?.licenseStatus;

    return licenseStatus === "EXPIRED";
  };

  const handleChange = (
    event: ChangeEvent<unknown>,
    value: AnytimeActionWithTypeAndCategory | null
  ): void => {
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
      <div className="text-bold">{Config.dashboardAnytimeActionDefaults.defaultAutocompleteHeaderText}</div>
      <span className={isDesktopAndUp ? "flex" : "flex-column"}>
        <Autocomplete
          renderInput={(params): ReactElement => {
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
          componentsProps={{
            popper: {
              modifiers: [
                {
                  name: "flip",
                  enabled: false,
                },
              ],
            },
          }}
          getOptionLabel={(option: AnytimeActionWithTypeAndCategory) => {
            return option.name;
          }}
          isOptionEqualToValue={(option, value) => {
            return option.name === value.name && option.filename === value.filename;
          }}
          groupBy={(option) => option.category}
          renderGroup={(params) => (
            <li key={params.key} className="anytime-action-header-group">
              <div className="text-secondary-vivid text-bold padding-left-2 ">{params.group}</div>
              <ul className="anytime-action-dropdown-ul-list-container">{params.children}</ul>
            </li>
          )}
          options={getApplicableAnytimeActions()}
          renderOption={(
            _props,
            option: AnytimeActionWithTypeAndCategory,
            { selected, inputValue }
          ): ReactElement => {
            let textComponent = <>{option.name}</>;

            const matches = option.name.toLowerCase().indexOf(inputValue.toLowerCase());
            if (matches >= 0) {
              const beforeMatch = option.name.slice(0, matches);
              const match = option.name.slice(matches, matches + inputValue.length);
              const afterMatch = option.name.slice(matches + inputValue.length);

              textComponent = (
                <>
                  {beforeMatch}
                  <span className="text-bold">{match}</span>
                  {afterMatch}
                </>
              );
            }

            const newClassName = `${_props.className} anytime-action-dropdown-option ${
              selected ? "bg-accent-cool-lightest" : ""
            } `;

            return (
              <li
                data-testid={`${option.filename}-option`}
                {..._props}
                className={newClassName}
                key={option.filename}
              >
                {selected ? (
                  <MenuOptionSelected>{textComponent}</MenuOptionSelected>
                ) : (
                  <MenuOptionUnselected>{textComponent}</MenuOptionUnselected>
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
                if (selectedAnytimeAction.type === "license-reinstatement") {
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
