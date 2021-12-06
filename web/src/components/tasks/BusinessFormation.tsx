import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { BusinessStartDate } from "@/components/tasks/business-formation/BusinessStartDate";
import { RegisteredAgent } from "@/components/tasks/business-formation/RegisteredAgent";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createEmptyFormationDisplayContent, FormationDisplayContent, Task } from "@/lib/types/types";
import { getModifiedTaskContent, templateEval } from "@/lib/utils/helpers";
import {
  createEmptyFormationData,
  FormationData,
  LookupLegalStructureById,
} from "@businessnjgovnavigator/shared";
import React, { createContext, ReactElement, useState } from "react";
import { Button } from "../njwds-extended/Button";
import { TaskCTA } from "../TaskCTA";
import { BusinessAddressLine1 } from "./business-formation/BusinessAddressLine1";
import { BusinessFormationNumericField } from "./business-formation/BusinessFormationNumericField";
import { BusinessFormationTextField } from "./business-formation/BusinessFormationTextField";
import { BusinessSuffixDropdown } from "./business-formation/BusinessSuffixDropdown";

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

    update({ ...userData, formationData });
  };
  const makeUpdateProfileLink = (label: string, value: string): ReactElement => {
    const linkElement = <a href="/profile">{BusinessFormationDefaults.updateYourProfileLinkText}</a>;
    const splitText = templateEval(BusinessFormationDefaults.updateYourProfileDisplayText, {
      value,
      link: "${link}",
    }).split("${link}");

    return (
      <div className="margin-bottom-2">
        <span className="text-bold">{label}&nbsp;</span>
        <span>
          {splitText[0]}
          {linkElement}
          {splitText[1]}
        </span>
      </div>
    );
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
        {makeUpdateProfileLink(
          BusinessFormationDefaults.legalStructureLabel,
          LookupLegalStructureById(userData?.profileData.legalStructureId).name
        )}
        {makeUpdateProfileLink(
          BusinessFormationDefaults.businessNameLabel,
          userData?.profileData.businessName || BusinessFormationDefaults.notSetBusinessNameText
        )}
        <BusinessSuffixDropdown />
        <BusinessStartDate />
        <BusinessAddressLine1 />
        <BusinessFormationTextField fieldName="businessAddressLine2" />
        {makeUpdateProfileLink(
          BusinessFormationDefaults.businessAddressCityLabel,
          userData?.profileData.municipality?.name || BusinessFormationDefaults.notSetBusinessAddressCityLabel
        )}
        <BusinessFormationTextField fieldName="businessAddressState" disabled={true} />
        <BusinessFormationNumericField
          minLength={5}
          maxLength={5}
          fieldName={"businessAddressZipCode"}
          validationText={BusinessFormationDefaults.businessAddressZipCode}
        />
        <RegisteredAgent />
        <Button style="primary" onClick={submitFormationData}>
          {BusinessFormationDefaults.submitButtonText}
        </Button>
      </div>
    </FormationContext.Provider>
  );
};
