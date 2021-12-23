import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds/Alert";
import { TaskHeader } from "@/components/TaskHeader";
import { RegisteredAgent } from "@/components/tasks/business-formation/RegisteredAgent";
import { Signatures } from "@/components/tasks/business-formation/Signatures";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import * as api from "@/lib/api-client/apiClient";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createEmptyFormationDisplayContent, FormationDisplayContent, Task } from "@/lib/types/types";
import { getModifiedTaskContent } from "@/lib/utils/helpers";
import { createEmptyFormationFormData, FormationFormData } from "@businessnjgovnavigator/shared";
import { useRouter } from "next/router";
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
  formationFormData: FormationFormData;
  displayContent: FormationDisplayContent;
}

interface FormationContextType {
  state: FormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
}

export const FormationContext = createContext<FormationContextType>({
  state: {
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent(),
  },
  setFormationFormData: () => {},
});

export const BusinessFormation = (props: Props): ReactElement => {
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const router = useRouter();
  const [formationFormData, setFormationFormData] = useState<FormationFormData>(
    createEmptyFormationFormData()
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isLLC = userData?.profileData.legalStructureId === "limited-liability-company";
  const unlockedByTaskLinks = taskFromRoadmap
    ? taskFromRoadmap.unlockedBy.filter((it) => userData?.taskProgress[it.id] !== "COMPLETED")
    : [];

  const submitFormationFormData = async () => {
    if (!userData) return;

    if (!formationFormData.businessSuffix) return;
    if (!formationFormData.businessAddressLine1) return;
    if (!formationFormData.businessAddressZipCode) return;
    if (!formationFormData.signer) return;
    if (formationFormData.agentNumberOrManual === "NUMBER") {
      if (!formationFormData.agentNumber) return;
    }
    if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      if (!formationFormData.agentName) return;
      if (!formationFormData.agentEmail) return;
      if (!formationFormData.agentOfficeAddressLine1) return;
      if (!formationFormData.agentOfficeAddressCity) return;
      if (!formationFormData.agentOfficeAddressZipCode) return;
    }

    if (!formationFormData.paymentType) return;

    const formationFormDataWithEmptySignersRemoved = {
      ...formationFormData,
      additionalSigners: formationFormData.additionalSigners.filter((it) => !!it),
    };

    setIsLoading(true);
    const newUserData = await api.postBusinessFormation({
      ...userData,
      formationData: {
        ...userData.formationData,
        formationFormData: formationFormDataWithEmptySignersRemoved,
      },
    });

    update(newUserData);
    setIsLoading(false);
    if (
      newUserData.formationData.formationResponse?.success &&
      newUserData.formationData.formationResponse?.redirect
    ) {
      await router.replace(newUserData.formationData.formationResponse.redirect);
    }
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
          formationFormData: formationFormData,
          displayContent: props.displayContent,
        },
        setFormationFormData,
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
        <Button loading={isLoading} style="primary" onClick={submitFormationFormData}>
          {BusinessFormationDefaults.submitButtonText}
        </Button>
        {userData.formationData.formationResponse &&
          !isLoading &&
          userData.formationData.formationResponse.errors.length > 0 && (
            <Alert variant="error" heading={BusinessFormationDefaults.submitErrorHeading}>
              <ul>
                {userData.formationData.formationResponse.errors.map((it) => (
                  <li key={it.field}>
                    {it.field}
                    <ul>
                      <li>{it.message}</li>
                    </ul>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
      </div>
    </FormationContext.Provider>
  );
};
