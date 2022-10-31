import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { TaskHeader } from "@/components/TaskHeader";
import { CannabisApplicationQuestionsTab } from "@/components/tasks/cannabis/CannabisApplicationQuestionsTab";
import { CannabisApplicationRequirementsTab } from "@/components/tasks/cannabis/CannabisApplicationRequirementsTab";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PriorityApplicationType, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useState } from "react";

interface Props {
  task: Task;
  CMS_ONLY_tab?: string; // for CMS only
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
  CMS_ONLY_isAnnual?: boolean; // for CMS only
  CMS_ONLY_isConditional?: boolean; // for CMS only
}

export const CannabisApplyForLicenseTask = (props: Props): ReactElement => {
  const userDataFromHook = useUserData();
  const updateQueue = userDataFromHook.updateQueue;
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;

  const [displayFirstTab, setDisplayFirstTab] = useState<boolean>(true);
  const [successSnackbarIsOpen, setSuccessSnackbarIsOpen] = useState(false);
  const [priorityStatusState, setPriorityStatusState] = useState<Record<PriorityApplicationType, boolean>>({
    diverselyOwned: false,
    socialEquity: false,
    impactZone: false,
  });
  const [noPriorityStatus, setNoPriorityStatus] = useState<boolean>(false);

  useMountEffectWhenDefined(() => {
    if (props.CMS_ONLY_tab === "1") {
      setDisplayFirstTab(true);
    }
    if (props.CMS_ONLY_tab === "2") {
      setDisplayFirstTab(false);
    }

    if (!userData) {
      return;
    }

    const minorityOrWomenPriorityTypeSelected = priorityTypesObj.minorityOrWomen.some((key) => {
      return userData.taskItemChecklist[key] === true;
    });

    const veteranPriorityTypeSelected = priorityTypesObj.veteran.some((key) => {
      return userData.taskItemChecklist[key] === true;
    });

    const impactZonePriorityTypeSelected = priorityTypesObj.impactZone.some((key) => {
      return userData.taskItemChecklist[key] === true;
    });

    const socialEquityPriorityTypeSelected = priorityTypesObj.socialEquity.some((key) => {
      return userData.taskItemChecklist[key] === true;
    });

    setPriorityStatusState({
      diverselyOwned: minorityOrWomenPriorityTypeSelected || veteranPriorityTypeSelected,
      impactZone: impactZonePriorityTypeSelected,
      socialEquity: socialEquityPriorityTypeSelected,
    });
    setNoPriorityStatus(
      !minorityOrWomenPriorityTypeSelected &&
        !veteranPriorityTypeSelected &&
        !impactZonePriorityTypeSelected &&
        !socialEquityPriorityTypeSelected
    );
  }, userData);

  const onCheckboxChange = (type: PriorityApplicationType, checked: boolean): void => {
    setPriorityStatusState((current) => {
      return {
        ...current,
        [type]: checked,
      };
    });
  };

  const onBack = (): void => {
    setDisplayFirstTab(true);
    scrollToTop();
  };

  const sendNextTabButtonAnalytics = (): void => {
    analytics.event.cannabis_license_form.click.view_requirements();
    if (priorityStatusState.impactZone) {
      analytics.event.cannabis_license_form_priority_status_impact_checkbox.submit.impact_zone_business();
    }
    if (priorityStatusState.socialEquity) {
      analytics.event.cannabis_license_form_priority_status_social_equity_checkbox.submit.social_equity_business();
    }
    if (priorityStatusState.diverselyOwned) {
      analytics.event.cannabis_license_form_priority_status_diversity_checkbox.submit.diversely_owned_business();
    }
  };

  const handleNextTabButtonClick = (): void => {
    if (!userData || !updateQueue) {
      return;
    }
    setDisplayFirstTab(false);
    scrollToTop();
    sendNextTabButtonAnalytics();
    if (
      userData.taskProgress[props.task.id] === undefined ||
      userData.taskProgress[props.task.id] === "NOT_STARTED"
    ) {
      setSuccessSnackbarIsOpen(true);
      updateQueue.queueTaskProgress({ [props.task.id]: "IN_PROGRESS" }).update();
    }
  };

  return (
    <>
      <SnackbarAlert
        variant="success"
        isOpen={successSnackbarIsOpen}
        close={() => {
          return setSuccessSnackbarIsOpen(false);
        }}
      >
        {Config.taskDefaults.taskProgressSuccessSnackbarBody}
      </SnackbarAlert>
      <TaskHeader task={props.task} />
      {displayFirstTab ? (
        <>
          <UnlockedBy task={props.task} />
          <CannabisApplicationQuestionsTab
            onNextTab={handleNextTabButtonClick}
            priorityStatusState={priorityStatusState}
            onCheckboxChange={onCheckboxChange}
            noPriorityStatus={noPriorityStatus}
          />
        </>
      ) : (
        <CannabisApplicationRequirementsTab
          onBack={onBack}
          priorityStatusState={priorityStatusState}
          task={props.task}
          CMS_ONLY_isAnnual={props.CMS_ONLY_isAnnual}
          CMS_ONLY_isConditional={props.CMS_ONLY_isConditional}
        />
      )}
    </>
  );
};
