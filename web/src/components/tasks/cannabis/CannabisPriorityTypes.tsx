import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  noneOfTheAbovePriorityId,
  PriorityType,
  priorityTypesObj,
} from "@/lib/domain-logic/cannabisPriorityTypes";
import { Task } from "@/lib/types/types";
import { templateEval, useMountEffect } from "@/lib/utils/helpers";
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
  const { updateQueue, business } = useUserData();
  const [displayNextTabButton, setDisplayNextTabButton] = useState(false);
  const [eligibityPhrase, setEligibiltyPhrase] = useState("");
  const { Config } = useConfig();

  useMountEffect(() => {
    if (props.CMS_ONLY_tab) {
      setDisplayNextTabButton(true);
    }
  });

  useEffect(() => {
    if (!business || !updateQueue) return;
    const priorityTypeSelected = priorityTypes.some((key) => {
      return business.taskItemChecklist[key];
    });

    if (priorityTypeSelected || business.taskItemChecklist[noneOfTheAbovePriorityId]) {
      setDisplayNextTabButton(true);
    } else {
      setDisplayNextTabButton(false);
    }

    if (priorityTypeSelected && business.taskItemChecklist[noneOfTheAbovePriorityId]) {
      updateQueue.queueTaskItemChecklist({ [noneOfTheAbovePriorityId]: false }).update();
    }
  }, [business, updateQueue]);

  useEffect(() => {
    if (!business) return;

    const isCheckboxesSelected = (priorityType: PriorityType): boolean => {
      return priorityTypesObj[priorityType].some((checkboxId) => {
        return business.taskItemChecklist[checkboxId] === true;
      });
    };

    const priorityStatusArray: Array<string> = [];

    if (isCheckboxesSelected("minorityOrWomen") || isCheckboxesSelected("veteran")) {
      priorityStatusArray.push(Config.cannabisPriorityStatus.minorityWomenOrVeteran);
    }
    if (isCheckboxesSelected("impactZone")) {
      priorityStatusArray.push(Config.cannabisPriorityStatus.impactZone);
    }
    if (isCheckboxesSelected("socialEquity")) {
      priorityStatusArray.push(Config.cannabisPriorityStatus.socialEquity);
    }

    const priorityStatusesAsIndexMap: Record<string, string> = {};
    for (const [i, val] of priorityStatusArray.entries()) {
      priorityStatusesAsIndexMap[`type${i + 1}`] = val;
    }

    const configLocation = `phrase${priorityStatusArray.length}` as "phrase1" | "phrase2" | "phrase3";
    if (priorityStatusArray.length > 0 && priorityStatusArray.length < 4) {
      setEligibiltyPhrase(
        templateEval(Config.cannabisPriorityStatus[configLocation], priorityStatusesAsIndexMap)
      );
    } else {
      setEligibiltyPhrase("");
    }
  }, [business, Config.cannabisPriorityStatus]);

  const handleNoneOfTheAboveCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!business || !updateQueue) return;

    if (event.target.checked) {
      const unselectPriorityTasks = {} as Record<string, boolean>;
      for (const key of priorityTypes) {
        unselectPriorityTasks[key] = false;
      }

      updateQueue
        .queueTaskItemChecklist({
          ...unselectPriorityTasks,
          [noneOfTheAbovePriorityId]: true,
        })
        .update();
    } else {
      updateQueue
        .queueTaskItemChecklist({
          [noneOfTheAbovePriorityId]: false,
        })
        .update();
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
                  checked={!!business?.taskItemChecklist[noneOfTheAbovePriorityId]}
                  data-testid="cannabis-priority-status-none"
                />
              }
            />
          </div>
        </ul>
      </div>

      {eligibityPhrase !== "" && (
        <Alert variant="info">
          <Content>{eligibityPhrase}</Content>
        </Alert>
      )}

      {displayNextTabButton && (
        <CtaContainer>
          <ActionBarLayout>
            <PrimaryButton
              isColor="primary"
              isRightMarginRemoved={true}
              dataTestId="nextTabButton"
              onClick={props.onNextTab}
            >
              {Config.cannabisPriorityStatus.nextButtonText}
            </PrimaryButton>
          </ActionBarLayout>
        </CtaContainer>
      )}
    </div>
  );
};
