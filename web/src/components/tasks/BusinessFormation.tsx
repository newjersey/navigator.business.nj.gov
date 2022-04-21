import { Content } from "@/components/Content";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { businessFormationTabs } from "@/components/tasks/business-formation/businessFormationTabs";
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
import {
  createEmptyFormationFormData,
  FormationFormData,
  getCurrentDate,
  getCurrentDateFormatted,
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { useRouter } from "next/router";
import React, { createContext, ReactElement, useEffect, useState } from "react";

interface Props {
  task: Task;
  displayContent: FormationDisplayContent;
  municipalities: Municipality[];
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
  municipalities: Municipality[];
  errorMap: FormationFieldErrorMap;
  showResponseAlert: boolean;
}

interface FormationContextType {
  state: FormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
  setErrorMap: (errorMap: FormationFieldErrorMap) => void;
  setTab: React.Dispatch<React.SetStateAction<number>>;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

export const FormationContext = createContext<FormationContextType>({
  state: {
    tab: 0,
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent(),
    municipalities: [],
    errorMap: createFormationFieldErrorMap(),
    showResponseAlert: false,
  },
  setFormationFormData: () => {},
  setErrorMap: () => {},
  setTab: () => {},
  setShowResponseAlert: () => {},
});

export const BusinessFormation = (props: Props): ReactElement => {
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const router = useRouter();

  const [formationFormData, setFormationFormData] = useState<FormationFormData>(
    createEmptyFormationFormData()
  );
  const [tab, setTab] = useState(0);
  const [errorMap, setErrorMap] = useState<FormationFieldErrorMap>(createFormationFieldErrorMap());
  const [showResponseAlert, setShowResponseAlert] = useState<boolean>(false);

  const isLLC = userData?.profileData.legalStructureId === "limited-liability-company";
  const unlockedByTaskLinks = taskFromRoadmap
    ? taskFromRoadmap.unlockedBy.filter((it) => userData?.taskProgress[it.id] !== "COMPLETED")
    : [];

  const getDate = (date?: string): string =>
    !date || parseDateWithFormat(date, "YYYY-MM-DD").isBefore(getCurrentDate())
      ? getCurrentDateFormatted("YYYY-MM-DD")
      : date;
  const stepNames = businessFormationTabs.map((value) => value.section);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    const splitName = splitFullName(userData.user.name);
    setFormationFormData({
      ...userData.formationData.formationFormData,
      businessName: userData.profileData.businessName,
      businessStartDate: getDate(userData.formationData.formationFormData.businessStartDate),
      businessAddressCity: userData.profileData.municipality,
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
      <div className="flex flex-column space-between minh-38">
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
      <div className="flex flex-column space-between minh-38">
        <TaskHeader task={props.task} />
        <FormationSuccessPage userData={userData} />
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
          municipalities: props.municipalities,
          errorMap: errorMap,
          showResponseAlert: showResponseAlert,
        },
        setFormationFormData,
        setErrorMap,
        setTab,
        setShowResponseAlert,
      }}
    >
      <div className="flex flex-column  minh-38">
        <div>
          <TaskHeader task={props.task} />
          {tab === 0 && (
            <>
              <UnlockedBy
                taskLinks={unlockedByTaskLinks}
                isLoading={!taskFromRoadmap}
                dataTestid="dependency-alert"
              />
              <div className="margin-bottom-2">
                <Content>{props.displayContent.introParagraph.contentMd}</Content>
              </div>
            </>
          )}
        </div>
        <div className="margin-top-3">
          <HorizontalStepper arrayOfSteps={stepNames} currentStep={tab} />
        </div>
        <div className="display-block">
          <hr className="margin-bottom-4" />
        </div>
        <div data-testid="formation-form" className="fg1 flex flex-column space-between">
          {businessFormationTabs[tab].component}
        </div>
      </div>
    </FormationContext.Provider>
  );
};
