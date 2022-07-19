import { Content } from "@/components/Content";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { BusinessFormationTabs } from "@/components/tasks/business-formation/BusinessFormationTabs";
import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { splitFullName } from "@/lib/domain-logic/splitFullName";
import { FormationDisplayContentMap, FormationFieldErrorMap, FormationFields, Task } from "@/lib/types/types";
import { getModifiedTaskContent, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  createEmptyFormationFormData,
  defaultFormationLegalType,
  FormationFormData,
  FormationLegalType,
  FormationLegalTypes,
  getCurrentDate,
  getCurrentDateFormatted,
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useState } from "react";
import { BusinessFormationTabsConfiguration } from "./BusinessFormationTabsConfiguration";

export const allowFormation = (legalStructureId: string | undefined) => {
  const featureFlagMap: Partial<Record<FormationLegalType, boolean>> = {
    "limited-partnership": process.env.FEATURE_BUSINESS_LP == "true",
    "limited-liability-partnership": process.env.FEATURE_BUSINESS_LLP == "true",
    "c-corporation": process.env.FEATURE_BUSINESS_CCORP == "true",
    "s-corporation": process.env.FEATURE_BUSINESS_SCORP == "true",
  };
  if (FormationLegalTypes.includes(legalStructureId as FormationLegalType)) {
    return featureFlagMap[legalStructureId as FormationLegalType] ?? true;
  }
  return false;
};

interface Props {
  task: Task;
  displayContent: FormationDisplayContentMap;
  municipalities: Municipality[];
}

const allFormationFormFields = Object.keys(createEmptyFormationFormData()) as (keyof FormationFormData)[];

const createFormationFieldErrorMap = (): FormationFieldErrorMap =>
  allFormationFormFields.reduce((acc, field: FormationFields) => {
    acc[field] = { invalid: false };
    return acc;
  }, {} as FormationFieldErrorMap);

export const BusinessFormation = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const router = useRouter();

  const [formationFormData, setFormationFormData] = useState<FormationFormData>(
    createEmptyFormationFormData()
  );
  const [tab, setTab] = useState(0);
  const [errorMap, setErrorMap] = useState<FormationFieldErrorMap>(createFormationFieldErrorMap());
  const [showResponseAlert, setShowResponseAlert] = useState<boolean>(false);

  const isValidLegalStructure = allowFormation(userData?.profileData.legalStructureId);

  const getDate = (date?: string): string =>
    !date || parseDateWithFormat(date, "YYYY-MM-DD").isBefore(getCurrentDate())
      ? getCurrentDateFormatted("YYYY-MM-DD")
      : date;
  const stepNames = BusinessFormationTabsConfiguration.map((value) => value.name);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    const splitName = splitFullName(userData.user.name);
    setFormationFormData({
      ...userData.formationData.formationFormData,
      businessName:
        userData.formationData.formationFormData.businessName ?? userData.profileData.businessName,
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
      router.replace({ pathname: `/tasks/${props.task.urlSlug}` }, undefined, { shallow: true });
      api.getCompletedFiling().then((newUserData) => update(newUserData));
    }
  }, [router.isReady, router.query.completeFiling, update, router, props.task.urlSlug]);

  const legalStructureId = useMemo(
    () => (userData?.profileData.legalStructureId ?? defaultFormationLegalType) as FormationLegalType,
    [userData?.profileData.legalStructureId]
  );

  if (!isValidLegalStructure) {
    return (
      <div className="flex flex-column space-between minh-38">
        <div>
          <TaskHeader task={props.task} />
          <UnlockedBy task={props.task} />
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
    <BusinessFormationContext.Provider
      value={{
        state: {
          tab: tab,
          legalStructureId: legalStructureId,
          formationFormData: formationFormData,
          displayContent: props.displayContent[legalStructureId],
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
              <UnlockedBy task={props.task} dataTestid="dependency-alert" />
              <div className="margin-bottom-2">
                <Content>{props.displayContent[legalStructureId].introParagraph.contentMd}</Content>
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
          {BusinessFormationTabs[tab].component}
        </div>
      </div>
    </BusinessFormationContext.Provider>
  );
};
