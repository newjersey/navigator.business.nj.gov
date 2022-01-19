import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { FormationSuccessPage } from "@/components/tasks/business-formation/FormationSuccessPage";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import * as api from "@/lib/api-client/apiClient";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { splitFullName } from "@/lib/domain-logic/splitFullName";
import {
  createEmptyFormationDisplayContent,
  FormationDisplayContent,
  FormationFieldErrorMap,
  FormationFields,
  Task,
} from "@/lib/types/types";
import { getModifiedTaskContent, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyFormationFormData, FormationFormData } from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { createContext, ReactElement, useEffect, useState } from "react";
import { TaskCTA } from "../TaskCTA";
import { BusinessSection } from "./business-formation/BusinessSection";
import { ContactsSection } from "./business-formation/ContactsSection";
import { PaymentSection } from "./business-formation/PaymentSection";

interface Props {
  task: Task;
  displayContent: FormationDisplayContent;
}

const allFormationFormFields = Object.keys(createEmptyFormationFormData()) as (keyof FormationFormData)[];

const createFormationFieldErrorMap = (): FormationFieldErrorMap =>
  allFormationFormFields.reduce((acc, field: FormationFields) => {
    acc[field] = { invalid: false };
    return acc;
  }, {} as FormationFieldErrorMap);

interface FormationState {
  tab: number;
  formationFormData: FormationFormData;
  displayContent: FormationDisplayContent;
  errorMap: FormationFieldErrorMap;
}

interface FormationContextType {
  state: FormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
  setErrorMap: (errorMap: FormationFieldErrorMap) => void;
  setTab: React.Dispatch<React.SetStateAction<number>>;
}

export const FormationContext = createContext<FormationContextType>({
  state: {
    tab: 1,
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent(),
    errorMap: createFormationFieldErrorMap(),
  },
  setFormationFormData: () => {},
  setErrorMap: () => {},
  setTab: () => {},
});

export const BusinessFormation = (props: Props): ReactElement => {
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const router = useRouter();
  const [formationFormData, setFormationFormData] = useState<FormationFormData>(
    createEmptyFormationFormData()
  );
  const [tab, setTab] = useState(1);

  const [errorMap, setErrorMap] = useState<FormationFieldErrorMap>(createFormationFieldErrorMap());

  const isLLC = userData?.profileData.legalStructureId === "limited-liability-company";
  const unlockedByTaskLinks = taskFromRoadmap
    ? taskFromRoadmap.unlockedBy.filter((it) => userData?.taskProgress[it.id] !== "COMPLETED")
    : [];

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    const splitName = splitFullName(userData.user.name);
    setFormationFormData({
      ...userData.formationData.formationFormData,
      businessStartDate:
        userData.formationData.formationFormData.businessStartDate || dayjs().format("YYYY-MM-DD"),
      contactFirstName: userData.formationData.formationFormData.contactFirstName || splitName.firstName,
      contactLastName: userData.formationData.formationFormData.contactLastName || splitName.lastName,
    });
  }, userData);

  useEffect(() => {
    if (!router.isReady) return;
    const completeFiling = router.query.completeFiling;
    if (completeFiling === "true") {
      router.replace({ pathname: "/tasks/form-business-entity" }, undefined, { shallow: true });
      api.getCompletedFiling().then((newUserData) => update(newUserData));
    }
  }, [router.isReady, router.query.completeFiling, update, router]);

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

  if (userData?.formationData.getFilingResponse?.success) {
    return (
      <div className="flex flex-column space-between minh-37">
        <TaskHeader task={props.task} />
        <FormationSuccessPage getFilingResponse={userData.formationData.getFilingResponse} />
      </div>
    );
  }

  return (
    <FormationContext.Provider
      value={{
        state: {
          tab: tab,
          formationFormData: formationFormData,
          displayContent: props.displayContent,
          errorMap: errorMap,
        },
        setFormationFormData,
        setErrorMap,
        setTab,
      }}
    >
      <div className="flex flex-column  minh-37">
        <div>
          <TaskHeader task={props.task} />
          {tab === 1 && (
            <UnlockedBy
              taskLinks={unlockedByTaskLinks}
              isLoading={!taskFromRoadmap}
              dataTestid="dependency-alert"
            />
          )}
        </div>
        <div data-testid="formation-form" className="fg1 flex flex-column space-between">
          <BusinessSection />
          <ContactsSection />
          <PaymentSection displayContent={props.displayContent} />
        </div>
      </div>
    </FormationContext.Provider>
  );
};
