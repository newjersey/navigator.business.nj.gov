import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { TaskHeader } from "@/components/TaskHeader";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { CannabisPriorityStatusDisplayContent, Task } from "@/lib/types/types";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox, FormControlLabel } from "@mui/material";
import React, { useEffect, useState } from "react";

interface Props {
  task: Task;
  displayContent: CannabisPriorityStatusDisplayContent;
}

export const priorityTypesObj = {
  minorityOrWomen: ["general-minority-owned", "general-women-owned"],
  veteran: ["general-veteran-owned"],
  impactZone: [
    "cannabis-business-in-impact-zone",
    "cannabis-owner-in-impact-zone",
    "cannabis-employee-in-impact-zone",
  ],
  socialEquity: [
    "cannabis-economically-disadvantaged-social-equity",
    "cannabis-criminal-offense-social-equity",
  ],
  noneOfTheAbove: "cannabis-priority-status-none",
};

const priorityTypes = [
  ...priorityTypesObj.minorityOrWomen,
  ...priorityTypesObj.veteran,
  ...priorityTypesObj.impactZone,
  ...priorityTypesObj.socialEquity,
];

export const CannabisPriorityStatus = (props: Props) => {
  const { userData, update } = useUserData();
  const [successToastIsOpen, setSuccessToastIsOpen] = useState(false);

  const [displayFirstTab, setDisplayFirstTab] = useState(true);
  const [displayNextTabButton, setDisplayNextTabButton] = useState(false);

  const [displayMWPriorityType, setDisplayMWPriorityType] = useState(false);
  const [displayVeteranPriorityType, setDisplayVeteranPriorityType] = useState(false);
  const [displayImpactZonePriorityType, setDisplayImpactZonePriorityType] = useState(false);
  const [displaySocialEquityPriorityType, setDisplaySocialEquityPriorityType] = useState(false);
  const [displayNoPriorityType, setDisplayNoPriorityType] = useState(false);

  useEffect(() => {
    if (!userData) return;
    if (displayFirstTab) {
      const priorityTypeSelected = priorityTypes.some((key) => userData.taskItemChecklist[key] === true);

      if (priorityTypeSelected || userData.taskItemChecklist[priorityTypesObj.noneOfTheAbove]) {
        setDisplayNextTabButton(true);
      } else setDisplayNextTabButton(false);

      if (priorityTypeSelected && userData.taskItemChecklist[priorityTypesObj.noneOfTheAbove]) {
        update({
          ...userData,
          taskItemChecklist: {
            ...userData.taskItemChecklist,
            [priorityTypesObj.noneOfTheAbove]: false,
          },
        });
      }
    } else {
      const minorityOrWomenPriorityTypeSelected = priorityTypesObj.minorityOrWomen.some(
        (key) => userData.taskItemChecklist[key] === true
      );
      const veteranPriorityTypeSelected = priorityTypesObj.veteran.some(
        (key) => userData.taskItemChecklist[key] === true
      );

      const impactZonePriorityTypeSelected = priorityTypesObj.impactZone.some(
        (key) => userData.taskItemChecklist[key] === true
      );

      const socialEquityPriorityTypeSelected = priorityTypesObj.socialEquity.some(
        (key) => userData.taskItemChecklist[key] === true
      );

      setDisplayMWPriorityType(minorityOrWomenPriorityTypeSelected);
      setDisplayVeteranPriorityType(veteranPriorityTypeSelected);
      setDisplayImpactZonePriorityType(impactZonePriorityTypeSelected);
      setDisplaySocialEquityPriorityType(socialEquityPriorityTypeSelected);
      setDisplayNoPriorityType(!!userData.taskItemChecklist[priorityTypesObj.noneOfTheAbove]);
    }
  }, [userData, update, displayFirstTab]);

  const handleNoneOfTheAboveCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData) return;

    if (event.target.checked) {
      const unselectPriorityTasks = {} as Record<string, boolean>;
      priorityTypes.forEach((key) => (unselectPriorityTasks[key] = false));

      update({
        ...userData,
        taskItemChecklist: {
          ...userData.taskItemChecklist,
          ...unselectPriorityTasks,
          [priorityTypesObj.noneOfTheAbove]: true,
        },
      });
    } else {
      update({
        ...userData,
        taskItemChecklist: {
          ...userData.taskItemChecklist,
          [priorityTypesObj.noneOfTheAbove]: false,
        },
      });
    }
  };

  const handleNextTabButtonClick = () => {
    if (!userData) return;

    setDisplayFirstTab(false);
    scrollToTop();
    if (
      userData.taskProgress[props.task.id] === undefined ||
      userData.taskProgress[props.task.id] === "NOT_STARTED"
    ) {
      setSuccessToastIsOpen(true);
      update({
        ...userData,
        taskProgress: {
          ...userData.taskProgress,
          [props.task.id]: "IN_PROGRESS",
        },
      });
    }
  };

  const handleBackButtonClick = () => {
    setDisplayFirstTab(true);
    scrollToTop();
  };

  const handleCompleteTaskButtonClick = () => {
    if (!userData) return;

    setSuccessToastIsOpen(true);
    update({
      ...userData,
      taskProgress: {
        ...userData.taskProgress,
        [props.task.id]: "COMPLETED",
      },
    });
  };

  const renderFirstTabContent = (
    <>
      <Content>{props.task.contentMd}</Content>
      <div className="usa-prose">
        <ul>
          <div className="margin-y-2">
            <FormControlLabel
              label={Config.cannabisPriorityStatus.noPriortyStatusCheckboxText}
              control={
                <Checkbox
                  onChange={handleNoneOfTheAboveCheckboxChange}
                  checked={
                    userData && userData.taskItemChecklist[priorityTypesObj.noneOfTheAbove]
                      ? userData.taskItemChecklist[priorityTypesObj.noneOfTheAbove]
                      : false
                  }
                  sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px" }}
                  data-testid="none-of-the-above"
                />
              }
            />
          </div>
        </ul>
      </div>
    </>
  );

  const renderSecondTabContent = (
    <>
      {!displayNoPriorityType && (
        <>
          <div className="margin-bottom-3">{Config.cannabisPriorityStatus.secondTabDescriptionText}</div>
          <h2>{Config.cannabisPriorityStatus.secondTabHeaderText}</h2>
        </>
      )}
      {displayMWPriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.minorityOrWomenHeaderText}</h3>
          <Content>{props.displayContent.genericMinorityAndWomenOwned.contentMd}</Content>
          {!displaySocialEquityPriorityType &&
            !displayImpactZonePriorityType &&
            !displayVeteranPriorityType && <hr className="margin-y-3" />}
        </>
      )}
      {displayVeteranPriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.veteranHeaderText}</h3>
          <Content>{props.displayContent.genericVeteranOwned.contentMd}</Content>
          {!displaySocialEquityPriorityType && !displayImpactZonePriorityType && (
            <hr className="margin-y-3" />
          )}
        </>
      )}
      {displaySocialEquityPriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.socialEquityHeaderText}</h3>
          <Content>{props.displayContent.cannabisSocialEquityBusiness.contentMd}</Content>
          {!displayImpactZonePriorityType && <hr className="margin-y-3" />}
        </>
      )}
      {displayImpactZonePriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.impactZoneHeaderText}</h3>
          <div>{Config.cannabisPriorityStatus.impactZoneText}</div>
          <hr className="margin-y-3" />
        </>
      )}
      {displayNoPriorityType && (
        <>
          <div>{Config.cannabisPriorityStatus.noPriorityStatusText}</div>
        </>
      )}
      {(displayMWPriorityType || displayVeteranPriorityType || displaySocialEquityPriorityType) && (
        <>
          <div className="green-box text-normal padding-2 margin-top-2 bg-success-lighter radius-lg">
            <div className="text-bold">{Config.cannabisPriorityStatus.greenBoxBoldedText}</div>
            <ul>
              {displayMWPriorityType && <li>{Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText}</li>}
              {displayVeteranPriorityType && <li>{Config.cannabisPriorityStatus.greenBoxVeteranText}</li>}
              {displaySocialEquityPriorityType && (
                <li>{Config.cannabisPriorityStatus.greenBoxSocialEquityText}</li>
              )}
            </ul>
          </div>
        </>
      )}
    </>
  );

  const renderCTA = (
    <div className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-top-3 margin-bottom-neg-205">
      {displayFirstTab && displayNextTabButton && (
        <Button style="primary" noRightMargin dataTestid="nextTabButton" onClick={handleNextTabButtonClick}>
          {Config.cannabisPriorityStatus.nextButtonText}
        </Button>
      )}
      {!displayFirstTab && (
        <Button style="secondary" dataTestid="backButton" onClick={handleBackButtonClick}>
          {Config.cannabisPriorityStatus.backButtonText}
        </Button>
      )}
      {!displayFirstTab && displaySocialEquityPriorityType && (
        <a
          href={Config.cannabisPriorityStatus.socialEquityButtonLink}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button
            style="primary"
            dataTestid="socialEquityButton"
            noRightMargin={!(displayMWPriorityType || displayVeteranPriorityType)}
          >
            {Config.cannabisPriorityStatus.socialEquityButtonText}
          </Button>
        </a>
      )}
      {!displayFirstTab && (displayMWPriorityType || displayVeteranPriorityType) && (
        <a
          href={Config.cannabisPriorityStatus.certificationButtonLink}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button style="primary" dataTestid="certificationButton" noRightMargin>
            {Config.cannabisPriorityStatus.certificationButtonText}
          </Button>
        </a>
      )}

      {!displayFirstTab && displayNoPriorityType && (
        <Button
          style="primary"
          noRightMargin
          dataTestid="completeTaskProgressButton"
          onClick={handleCompleteTaskButtonClick}
        >
          {Config.cannabisPriorityStatus.completeTaskProgressButtonText}
        </Button>
      )}
      {!displayFirstTab &&
        displayImpactZonePriorityType &&
        !displayMWPriorityType &&
        !displayVeteranPriorityType &&
        !displaySocialEquityPriorityType &&
        !displayNoPriorityType && (
          <Button
            style="primary"
            noRightMargin
            dataTestid="completeTaskProgressButton"
            onClick={handleCompleteTaskButtonClick}
          >
            {Config.cannabisPriorityStatus.completeTaskProgressButtonText}
          </Button>
        )}
    </div>
  );

  return (
    <div className="flex flex-column space-between minh-38">
      <div>
        <ToastAlert variant="success" isOpen={successToastIsOpen} close={() => setSuccessToastIsOpen(false)}>
          {Config.taskDefaults.taskProgressSuccessToastBody}
        </ToastAlert>
        <TaskHeader task={props.task} />
        <UnlockedBy task={props.task} />
        {displayFirstTab ? renderFirstTabContent : renderSecondTabContent}
      </div>
      {renderCTA}
    </div>
  );
};
