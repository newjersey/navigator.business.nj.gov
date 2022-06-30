import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { noneOfTheAbovePriorityId, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Task } from "@/lib/types/types";
import { useMountEffect } from "@/lib/utils/helpers";
import { Checkbox, FormControlLabel } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";

const priorityTypes = [
  ...priorityTypesObj.minorityOrWomen,
  ...priorityTypesObj.veteran,
  ...priorityTypesObj.impactZone,
  ...priorityTypesObj.socialEquity,
];

interface Props {
  task: Task;
  onNextTab: () => void;
  CMS_ONLY_tab?: string; // for CMS only
}

export const CannabisPriorityTypes = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const [displayNextTabButton, setDisplayNextTabButton] = useState(false);
  const { Config } = useConfig();

  useMountEffect(() => {
    if (props.CMS_ONLY_tab) {
      setDisplayNextTabButton(true);
    }
  });

  useEffect(() => {
    if (!userData) return;
    const priorityTypeSelected = priorityTypes.some((key) => userData.taskItemChecklist[key] === true);

    if (priorityTypeSelected || userData.taskItemChecklist[noneOfTheAbovePriorityId]) {
      setDisplayNextTabButton(true);
    } else {
      setDisplayNextTabButton(false);
    }

    if (priorityTypeSelected && userData.taskItemChecklist[noneOfTheAbovePriorityId]) {
      update({
        ...userData,
        taskItemChecklist: {
          ...userData.taskItemChecklist,
          [noneOfTheAbovePriorityId]: false,
        },
      });
    }
  }, [userData, update]);

  const handleNoneOfTheAboveCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userData) return;

    if (event.target.checked) {
      const unselectPriorityTasks = {} as Record<string, boolean>;
      for (const key of priorityTypes) unselectPriorityTasks[key] = false;

      update({
        ...userData,
        taskItemChecklist: {
          ...userData.taskItemChecklist,
          ...unselectPriorityTasks,
          [noneOfTheAbovePriorityId]: true,
        },
      });
    } else {
      update({
        ...userData,
        taskItemChecklist: {
          ...userData.taskItemChecklist,
          [noneOfTheAbovePriorityId]: false,
        },
      });
    }
  };

  return (
    <div data-testid="tab1">
      <Content>{Config.cannabisPriorityStatus.tab1Content}</Content>
      <div className="usa-prose margin-bottom-3">
        <ul style={{ marginTop: 0 }}>
          <div className="margin-bottom-2">
            <FormControlLabel
              label={Config.cannabisPriorityStatus.noPriorityStatusCheckboxText}
              control={
                <Checkbox
                  onChange={handleNoneOfTheAboveCheckboxChange}
                  checked={!!userData?.taskItemChecklist[noneOfTheAbovePriorityId]}
                  sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px", paddingLeft: "0px" }}
                  data-testid="cannabis-priority-status-none"
                />
              }
            />
          </div>
        </ul>
      </div>
      <div
        style={{ marginTop: "auto" }}
        className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-bottom-neg-205"
      >
        {displayNextTabButton && (
          <Button style="primary" noRightMargin dataTestid="nextTabButton" onClick={props.onNextTab}>
            {Config.cannabisPriorityStatus.nextButtonText}
          </Button>
        )}
      </div>
    </div>
  );
};
