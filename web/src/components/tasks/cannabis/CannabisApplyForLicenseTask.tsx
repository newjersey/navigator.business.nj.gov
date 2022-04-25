import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { TaskHeader } from "@/components/TaskHeader";
import { CannabisApplicationQuestionsTab } from "@/components/tasks/cannabis/CannabisApplicationQuestionsTab";
import { CannabisApplicationRequirementsTab } from "@/components/tasks/cannabis/CannabisApplicationRequirementsTab";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PriorityApplicationType, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { CannabisApplyForLicenseDisplayContent, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useState } from "react";

interface Props {
  task: Task;
  displayContent: CannabisApplyForLicenseDisplayContent;
}

export const CannabisApplyForLicenseTask = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const [displayFirstTab, setDisplayFirstTab] = useState<boolean>(true);
  const [successToastIsOpen, setSuccessToastIsOpen] = useState(false);
  const [priorityStatusState, setPriorityStatusState] = useState<Record<PriorityApplicationType, boolean>>({
    diverselyOwned: false,
    socialEquity: false,
    impactZone: false,
  });

  useMountEffectWhenDefined(() => {
    if (!userData) return;

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

    setPriorityStatusState({
      diverselyOwned: minorityOrWomenPriorityTypeSelected || veteranPriorityTypeSelected,
      impactZone: impactZonePriorityTypeSelected,
      socialEquity: socialEquityPriorityTypeSelected,
    });
  }, userData);

  const onCheckboxChange = (type: PriorityApplicationType, checked: boolean): void => {
    setPriorityStatusState((current) => ({
      ...current,
      [type]: checked,
    }));
  };

  const onBack = (): void => {
    setDisplayFirstTab(true);
    scrollToTop();
  };

  const handleNextTabButtonClick = (): void => {
    if (!userData) return;
    setDisplayFirstTab(false);
    scrollToTop();
    analytics.event.cannabis_license_form.click.view_requirements();
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

  return (
    <>
      <ToastAlert variant="success" isOpen={successToastIsOpen} close={() => setSuccessToastIsOpen(false)}>
        {Config.taskDefaults.taskProgressSuccessToastBody}
      </ToastAlert>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      {displayFirstTab ? (
        <CannabisApplicationQuestionsTab
          onNextTab={handleNextTabButtonClick}
          priorityStatusState={priorityStatusState}
          onCheckboxChange={onCheckboxChange}
        />
      ) : (
        <CannabisApplicationRequirementsTab
          onBack={onBack}
          priorityStatusState={priorityStatusState}
          task={props.task}
          displayContent={props.displayContent}
        />
      )}
    </>
  );
};
