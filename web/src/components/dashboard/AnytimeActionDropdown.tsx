import { HorizontalLine } from "@/components/HorizontalLine";
import { MenuOptionSelected } from "@/components/MenuOptionSelected";
import { MenuOptionUnselected } from "@/components/MenuOptionUnselected";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import {
  AnytimeActionCategory,
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@businessnjgovnavigator/shared/types";
import { Autocomplete, TextField, useMediaQuery } from "@mui/material";
import { orderBy, unionBy } from "lodash";
import { useRouter } from "next/compat/router";
import { ChangeEvent, type ReactElement, ReactNode, useState } from "react";

interface Props {
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionTasksFromNonEssentialQuestions: AnytimeActionTask[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
}

type AnytimeAction = AnytimeActionTask | AnytimeActionLicenseReinstatement;
type AnytimeActionWithTypeAndCategory = AnytimeAction & {
  type: string;
  category: AnytimeActionCategory[];
};

const getBoldedTextComponent = (searchValue: string, textToBold: string): ReactNode => {
  const matches = textToBold.toLowerCase().indexOf(searchValue.toLowerCase());
  if (matches >= 0) {
    const beforeMatch = textToBold.slice(0, matches);
    const match = textToBold.slice(matches, matches + searchValue.length);
    const afterMatch = textToBold.slice(matches + searchValue.length);

    return (
      <>
        {beforeMatch}
        <span className="text-bold">{match}</span>
        {afterMatch}
      </>
    );
  }
  return <>{textToBold}</>;
};

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

  const getApplicableAnytimeActions = (): AnytimeActionWithTypeAndCategory[] => {
    const [tasks, reinstatements] = [
      props.anytimeActionTasks.filter(findMatch).map((action) => {
        return {
          ...action,
          category: action.category,
        };
      }),
      props.anytimeActionLicenseReinstatements.filter(licenseReinstatementMatch).map((action) => {
        return {
          ...action,
        };
      }),
    ];

    const deduplicatedTasks = unionBy(
      tasks,
      props.anytimeActionTasksFromNonEssentialQuestions,
      "name",
    );

    const orderedTasks = orderBy(deduplicatedTasks, ["name"]);
    const orderedReinstatements = orderBy(reinstatements, ["name"]);

    const allActions = [...orderedTasks, ...orderedReinstatements];

    return allActions.sort((a, b) => {
      const categoryA = a.category[0].categoryName.toLowerCase();
      const categoryB = b.category[0].categoryName.toLowerCase();
      return categoryA.localeCompare(categoryB);
    });
  };

  const findMatch = (action: AnytimeActionTask): boolean => {
    if ("category" in action && action.category[0].categoryId === "only-show-in-subtask")
      return false;
    if (action.applyToAllUsers) return true;
    if (action.industryIds && industryId && action.industryIds.includes(industryId)) return true;
    if (isAnytimeActionFromNonEssentialQuestions(action)) return true;
    return !!(action.sectorIds && sectorId && action.sectorIds.includes(sectorId));
  };

  const isAnytimeActionFromNonEssentialQuestions = (action: AnytimeActionTask): boolean => {
    switch (action.filename) {
      case "carnival-ride-supplemental-modification":
        return (
          !!business?.profileData.carnivalRideOwningBusiness ||
          !!business?.profileData.nonEssentialRadioAnswers["carnival-ride-permitting"]
        );
      case "operating-carnival-fire-permit":
        return (
          !!business?.profileData.carnivalRideOwningBusiness ||
          !!business?.profileData.travelingCircusOrCarnivalOwningBusiness ||
          !!business?.profileData.nonEssentialRadioAnswers["carnival-ride-permitting"] ||
          !!business?.profileData.nonEssentialRadioAnswers["carnival-fire-licenses"]
        );
      case "vacant-building-fire-permit":
        return !!business?.profileData.vacantPropertyOwner;
      default:
        return false;
    }
  };

  const licenseReinstatementMatch = (action: AnytimeActionLicenseReinstatement): boolean => {
    const licenseNameFromAnytimeAction = action.licenseName;
    const licenseStatus =
      business?.licenseData?.licenses?.[licenseNameFromAnytimeAction]?.licenseStatus;

    return licenseStatus === "EXPIRED";
  };

  const handleChange = (
    event: ChangeEvent<unknown>,
    value: AnytimeActionWithTypeAndCategory | null,
  ): void => {
    if (value === null) {
      setSelectedAnytimeAction(undefined);
    } else {
      setSelectedAnytimeAction(value);
    }
  };

  return (
    <div className={"anytime-action-dropdown-container"}>
      <Heading level={2}>{Config.dashboardAnytimeActionDefaults.defaultHeaderText}</Heading>
      <HorizontalLine ariaHidden={true} />
      <div className="text-bold">
        {Config.dashboardAnytimeActionDefaults.defaultAutocompleteHeaderText}
      </div>
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
          groupBy={(option) => option.category[0].categoryName} // Currently just showing the first category
          renderGroup={(params) => (
            <li key={params.key} className="anytime-action-header-group">
              <div className="text-secondary-vivid text-bold padding-left-2 ">{params.group}</div>
              <ul className="anytime-action-dropdown-ul-list-container">{params.children}</ul>
            </li>
          )}
          options={getApplicableAnytimeActions()}
          filterOptions={(options, state) => {
            const searchValue = state.inputValue.toLowerCase();
            if (searchValue === "") {
              return options;
            }
            return options.filter((option) => {
              if (option.synonyms) {
                for (const synonym of option.synonyms) {
                  if (synonym.toLowerCase().includes(searchValue)) {
                    return true;
                  }
                }
              }
              return (
                option.name.toLowerCase().includes(searchValue) ||
                option.description?.toLowerCase().includes(searchValue)
              );
            });
          }}
          renderOption={(
            _props,
            option: AnytimeActionWithTypeAndCategory,
            { selected, inputValue },
          ): ReactElement => {
            const titleText = getBoldedTextComponent(inputValue, option.name);
            const descriptionText = getBoldedTextComponent(inputValue, option.description ?? "");

            const newClassName = `${_props.className} anytime-action-dropdown-option ${
              selected ? "bg-accent-cool-lightest" : ""
            } fdc`;

            return (
              <li
                data-testid={`${option.filename}-option`}
                {..._props}
                className={newClassName}
                key={option.filename}
              >
                {selected ? (
                  <MenuOptionSelected secondaryText={descriptionText}>
                    {titleText}
                  </MenuOptionSelected>
                ) : (
                  <MenuOptionUnselected secondaryText={descriptionText}>
                    {titleText}
                  </MenuOptionUnselected>
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
              isDesktopAndUp
                ? "anytime-action-primary-button"
                : "anytime-action-primary-button-mobile"
            }
          >
            {" "}
            <PrimaryButton
              isColor={"primary"}
              dataTestId={"anytimeActionPrimaryButton"}
              onClick={() => {
                if (!router) return;
                analytics.event.anytime_action_button.click.go_to_anytime_action_screen(
                  selectedAnytimeAction.filename,
                );
                if (selectedAnytimeAction.type === "task") {
                  router.push(
                    `${ROUTES.anytimeActions}/${
                      (selectedAnytimeAction as AnytimeActionTask).urlSlug
                    }`,
                  );
                }
                if (selectedAnytimeAction.type === "license-reinstatement") {
                  router.push(
                    `${ROUTES.licenseReinstatement}/${
                      (selectedAnytimeAction as AnytimeActionLicenseReinstatement).urlSlug
                    }`,
                  );
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
