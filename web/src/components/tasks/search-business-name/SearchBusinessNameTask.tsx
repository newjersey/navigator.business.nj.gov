import { TaskHeader } from "@/components/TaskHeader";
import { BusinessNameStep } from "@/components/tasks/business-formation/name/BusinessNameStep";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  createEmptyFormationFormData,
  FormationFormData,
  NameAvailability,
} from "@businessnjgovnavigator/shared";
import { createEmptyDbaDisplayContent, Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement, SetStateAction, useState } from "react";

type Props = { task: Task };

export const SearchBusinessNameTask = ({ task }: Props): ReactElement => {
  const [nameAvailability, setNameAvailability] = useState<NameAvailability | undefined>();
  const [formationFormData, setFormationFormData] = useState<FormationFormData>(() => ({
    ...createEmptyFormationFormData(),
    legalType: "limited-liability-company",
  }));
  const { updateQueue } = useUserData();
  const { queueUpdateTaskProgress, congratulatoryModal } = useUpdateTaskProgress();

  const handleSetBusinessNameAvailability = (
    availability: SetStateAction<NameAvailability | undefined>,
  ): void => {
    setNameAvailability(availability);
  };

  const handleSave = (): void => {
    if (nameAvailability?.status !== "AVAILABLE" || !updateQueue) return;
    updateQueue.queueProfileData({ businessName: formationFormData.businessName });
    queueUpdateTaskProgress(task.id, "COMPLETED");
    updateQueue.update();
  };

  const isSaveEnabled = nameAvailability?.status === "AVAILABLE";

  return (
    <BusinessFormationContext.Provider
      value={{
        state: {
          stepIndex: 0,
          formationFormData,
          businessNameAvailability: nameAvailability,
          dbaBusinessNameAvailability: undefined,
          showResponseAlert: false,
          hasBeenSubmitted: false,
          dbaContent: createEmptyDbaDisplayContent(),
          interactedFields: [],
          hasSetStateFirstTime: true,
          foreignGoodStandingFile: undefined,
          reviewCheckboxes: {
            namesAddressesDatesChecked: false,
            permanentRecordChecked: false,
            correctionFeesChecked: false,
          },
        },
        setFormationFormData,
        setStepIndex: () => {},
        setShowResponseAlert: () => {},
        setFieldsInteracted: () => {},
        setHasBeenSubmitted: () => {},
        setBusinessNameAvailability: handleSetBusinessNameAvailability,
        setDbaBusinessNameAvailability: () => {},
        setForeignGoodStandingFile: () => {},
        setReviewCheckboxes: () => {},
        allConfirmationsChecked: () => false,
      }}
    >
      <div>
        <TaskHeader task={task} />
        <BusinessNameStep />
        <div className="margin-top-2">
          <button
            type="button"
            className={`usa-button usa-button--outline margin-right-0${isSaveEnabled ? "" : " usa-button--disabled"}`}
            disabled={!isSaveEnabled}
            onClick={handleSave}
            data-testid="save-business-name"
          >
            Save
          </button>
        </div>
        {congratulatoryModal}
      </div>
    </BusinessFormationContext.Provider>
  );
};
