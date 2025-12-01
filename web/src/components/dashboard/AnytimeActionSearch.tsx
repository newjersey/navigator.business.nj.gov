import { Content } from "@/components/Content";
import { AnytimeActionSearchElement } from "@/components/dashboard/AnytimeActionSearchElement";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import {
  AnytimeActionCategory,
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@businessnjgovnavigator/shared/types";
import { Autocomplete, TextField, useMediaQuery } from "@mui/material";
import { orderBy, unionBy } from "lodash";
import { useRouter } from "next/compat/router";
import { type ReactElement, ReactNode, useState } from "react";

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

export const AnytimeActionSearch = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();
  const { business } = useUserData();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);
  const industryId = business?.profileData.industryId;
  const sectorId = business?.profileData.sectorId;

  const getApplicableAnytimeActions = (): AnytimeActionWithTypeAndCategory[] => {
    const anytimeActionTasks = moveAnytimeActionsToRecommendedForYouSection(
      props.anytimeActionTasks,
    );

    const [tasks, reinstatements] = [
      anytimeActionTasks.filter(findMatch).map((action) => {
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

      if (categoryA === RECOMMENDED_FOR_YOU_DISPLAY_TEXT.toLowerCase()) {
        return -1;
      }
      if (categoryB === RECOMMENDED_FOR_YOU_DISPLAY_TEXT.toLowerCase()) {
        return 1;
      }

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

  const RECOMMENDED_FOR_YOU_DISPLAY_TEXT =
    Config.dashboardAnytimeActionDefaults.recommendedForYouCategoryHeader;
  const RECOMMENDED_FOR_YOU_ID = "recommended-for-you";

  const moveAnytimeActionsToRecommendedForYouSection = (
    anytimeActions: AnytimeActionTask[],
  ): AnytimeActionTask[] => {
    const anytimeActionsWithRecommendedForYouCategorysOverriden = anytimeActions;

    for (const [
      index,
      anytimeAction,
    ] of anytimeActionsWithRecommendedForYouCategorysOverriden.entries()) {
      if (anytimeAction.moveToRecommendedForYouSection) {
        anytimeActionsWithRecommendedForYouCategorysOverriden[index].category[0].categoryName =
          RECOMMENDED_FOR_YOU_DISPLAY_TEXT;
        anytimeActionsWithRecommendedForYouCategorysOverriden[index].category[0].categoryId =
          RECOMMENDED_FOR_YOU_ID;
      }
      if (anytimeAction.nonEssentialQuestionsMoveToRecommendedAnytimeActionIds) {
        for (const nonEssentialQuestionId of anytimeAction.nonEssentialQuestionsMoveToRecommendedAnytimeActionIds) {
          if (business?.profileData.nonEssentialRadioAnswers[nonEssentialQuestionId]) {
            anytimeActionsWithRecommendedForYouCategorysOverriden[index].category[0].categoryName =
              RECOMMENDED_FOR_YOU_DISPLAY_TEXT;
            anytimeActionsWithRecommendedForYouCategorysOverriden[index].category[0].categoryId =
              RECOMMENDED_FOR_YOU_ID;
          }
        }
      }
    }

    return anytimeActionsWithRecommendedForYouCategorysOverriden;
  };

  const [isFocused, setIsFocused] = useState(false);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAnytimeActionClick = (value: AnytimeActionWithTypeAndCategory): void => {
    if (router && value && typeof value !== "string") {
      analytics.event.anytime_action_button.click.go_to_anytime_action_screen(value.filename);
      if (value.type === "task") {
        router.push(`${ROUTES.anytimeActions}/${(value as AnytimeActionTask).urlSlug}`);
      }
      if (value.type === "license-reinstatement") {
        router.push(
          `${ROUTES.licenseReinstatement}/${(value as AnytimeActionLicenseReinstatement).urlSlug}`,
        );
      }
    }
  };

  return (
    <>
      <span className={isDesktopAndUp ? "flex" : "flex-column"}>
        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          renderInput={(params): ReactElement => {
            return (
              <TextField
                {...params}
                inputProps={{
                  "aria-label": "anytimeActionSearch",
                  "data-testid": "anytimeActionSearch",
                  ...params.inputProps,
                  className: `disable-focus-outline ${params.inputProps.className}`,
                }}
                placeholder={
                  isFocused ? "" : Config.dashboardAnytimeActionDefaults.searchFieldHintText
                }
                onFocus={() => {
                  setIsFocused(true);
                  setOpen(true);
                }}
                onBlur={() => setIsFocused(false)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <img className="" src="/img/search.svg" alt="" role="presentation" />
                  ),
                }}
                variant="outlined"
              />
            );
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          inputValue={inputValue}
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
          getOptionLabel={(option: AnytimeActionWithTypeAndCategory | string) => {
            if (typeof option === "string") {
              return option;
            }
            return option.name;
          }}
          isOptionEqualToValue={(option, value) => {
            return option.name === value.name && option.filename === value.filename;
          }}
          groupBy={(option) => option.category[0].categoryName} // Currently just showing the first category
          renderGroup={(params) => {
            return (
              <li key={params.key} className="anytime-action-header-group">
                <div className="padding-left-2 font-body-2xs text-base">{params.group}</div>
                <ul className="anytime-action-dropdown-ul-list-container">{params.children}</ul>
              </li>
            );
          }}
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
          onChange={(event, value) => {
            if (value !== null) {
              handleAnytimeActionClick(value);
            }
          }}
          noOptionsText={
            <Content>
              {templateEval(Config.dashboardAnytimeActionDefaults.searchHasNoOptionsText, {
                inputValue: inputValue,
              })}
            </Content>
          }
          renderOption={(
            _props,
            option: AnytimeActionWithTypeAndCategory,
            { inputValue },
          ): ReactElement => {
            const titleText = getBoldedTextComponent(inputValue, option.name);
            const descriptionText = getBoldedTextComponent(inputValue, option.description ?? "");

            return (
              // must fix for keyboard
              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events
              <li
                data-testid={`${option.filename}-option`}
                {..._props}
                className={`${_props.className} anytime-action-dropdown-option fdr`}
                key={option.filename}
                onClick={() => {
                  handleAnytimeActionClick(option);
                }}
                onKeyDown={(event: React.KeyboardEvent) => {
                  if (event.key === "Enter") {
                    handleAnytimeActionClick(option);
                  }
                }}
              >
                <img
                  src="/img/subdirectory_arrow_right.svg"
                  alt=""
                  role="presentation"
                  key={"subdirectory_arrow"}
                />
                <div className="fdc" key={option.filename}>
                  <AnytimeActionSearchElement secondaryText={descriptionText}>
                    {titleText}
                  </AnytimeActionSearchElement>
                </div>
              </li>
            );
          }}
          className={" anytime-action-dropdown width-100 "}
        />
      </span>
    </>
  );
};
