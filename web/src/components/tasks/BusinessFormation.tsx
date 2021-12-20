import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { RegisteredAgent } from "@/components/tasks/business-formation/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/Signatures";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createEmptyFormationDisplayContent, FormationDisplayContent, Task } from "@/lib/types/types";
import { getModifiedTaskContent } from "@/lib/utils/helpers";
import { createEmptyFormationData, FormationData } from "@businessnjgovnavigator/shared";
import React, { createContext, ReactElement, useState } from "react";
import { Button } from "../njwds-extended/Button";
import { TaskCTA } from "../TaskCTA";
import { BusinessFormationDocuments } from "./business-formation/BusinessFormationDocuments";
import { BusinessFormationNotifications } from "./business-formation/BusinessFormationNotifications";
import { BusinessNameAndLegalStructure } from "./business-formation/BusinessNameAndLegalStructure";
import { PaymentTypeDropdown } from "./business-formation/PaymentTypeDropdown";

interface Props {
  task: Task;
  displayContent: FormationDisplayContent;
}

interface FormationState {
  formationData: FormationData;
  displayContent: FormationDisplayContent;
}

interface FormationContextType {
  state: FormationState;
  setFormationData: (formationData: FormationData) => void;
}

export const FormationContext = createContext<FormationContextType>({
  state: {
    formationData: createEmptyFormationData(),
    displayContent: createEmptyFormationDisplayContent(),
  },
  setFormationData: () => {},
});

export const BusinessFormation = (props: Props): ReactElement => {
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const [formationData, setFormationData] = useState<FormationData>(createEmptyFormationData());

  const isLLC = userData?.profileData.legalStructureId === "limited-liability-company";
  const unlockedByTaskLinks = taskFromRoadmap
    ? taskFromRoadmap.unlockedBy.filter((it) => userData?.taskProgress[it.id] !== "COMPLETED")
    : [];

  const submitFormationData = () => {
    if (!userData) return;

    if (!formationData.businessSuffix) return;
    if (!formationData.businessAddressLine1) return;
    if (!formationData.businessAddressZipCode) return;
    if (!formationData.signer) return;
    if (formationData.agentNumberOrManual === "NUMBER") {
      if (!formationData.agentNumber) return;
    }
    if (formationData.agentNumberOrManual === "MANUAL_ENTRY") {
      if (!formationData.agentName) return;
      if (!formationData.agentEmail) return;
      if (!formationData.agentOfficeAddressLine1) return;
      if (!formationData.agentOfficeAddressCity) return;
      if (!formationData.agentOfficeAddressZipCode) return;
    }

    if (!formationData.paymentType) return;

    const removedEmptySigners = {
      ...formationData,
      additionalSigners: formationData.additionalSigners.filter((it) => !!it),
    };

    update({ ...userData, formationData: removedEmptySigners });
  };

  if (!isLLC) {
    return (
      <div className="flex flex-column space-between minh-37">
        <div>
          <TaskHeader task={props.task} />
          <UnlockedBy taskLinks={unlockedByTaskLinks} isLoading={!taskFromRoadmap} />
          <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
        </div>
        <TaskCTA
          link={getModifiedTaskContent(roadmap, props.task, "callToActionLink")}
          text={getModifiedTaskContent(roadmap, props.task, "callToActionText")}
        />
      </div>
    );
  }

  return (
    <FormationContext.Provider
      value={{
        state: {
          formationData: formationData,
          displayContent: props.displayContent,
        },
        setFormationData,
      }}
    >
      <TaskHeader task={props.task} />
      <UnlockedBy taskLinks={unlockedByTaskLinks} isLoading={!taskFromRoadmap} />
      <div data-testid="formation-form">
        <BusinessNameAndLegalStructure />
        <RegisteredAgent />
        <Signatures />
        <PaymentTypeDropdown />
        <BusinessFormationDocuments />
        <Content>{props.displayContent.disclaimer.contentMd}</Content>
        <BusinessFormationNotifications />
        <Button style="primary" onClick={submitFormationData}>
          {BusinessFormationDefaults.submitButtonText}
        </Button>
      </div>
    </FormationContext.Provider>
  );
};
