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
import { splitFullName } from "@/lib/domain-logic/splitFullName";
import {
  createEmptyFormationDisplayContent,
  FieldStatus,
  FormationDisplayContent,
  Task,
} from "@/lib/types/types";
import {
  camelCaseToSentence,
  getModifiedTaskContent,
  templateEval,
  useMountEffectWhenDefined,
} from "@/lib/utils/helpers";
import { createEmptyFormationFormData, FormationFormData } from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { createContext, ReactElement, useMemo, useState } from "react";
import { Button } from "../njwds-extended/Button";
import { TaskCTA } from "../TaskCTA";
import { BusinessFormationDocuments } from "./business-formation/BusinessFormationDocuments";
import { BusinessFormationNotifications } from "./business-formation/BusinessFormationNotifications";
import { BusinessNameAndLegalStructure } from "./business-formation/BusinessNameAndLegalStructure";
import { ContactFirstName } from "./business-formation/ContactFirstName";
import { ContactLastName } from "./business-formation/ContactLastName";
import { ContactPhoneNumber } from "./business-formation/ContactPhoneNumber";
import { PaymentTypeDropdown } from "./business-formation/PaymentTypeDropdown";

interface Props {
  task: Task;
  displayContent: FormationDisplayContent;
}

type FormationFields = keyof FormationFormData;
type FormationFieldErrorMap = Record<FormationFields, FieldStatus>;

const allFormationFormFields = Object.keys(createEmptyFormationFormData()) as (keyof FormationFormData)[];

const createFormationFieldErrorMap = (): FormationFieldErrorMap =>
  allFormationFormFields.reduce((acc, field: FormationFields) => {
    acc[field] = { invalid: false };
    return acc;
  }, {} as FormationFieldErrorMap);

interface FormationState {
  formationFormData: FormationFormData;
  displayContent: FormationDisplayContent;
  errorMap: FormationFieldErrorMap;
}

interface FormationContextType {
  state: FormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
  setErrorMap: (errorMap: FormationFieldErrorMap) => void;
}

export const FormationContext = createContext<FormationContextType>({
  state: {
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent(),
    errorMap: createFormationFieldErrorMap(),
  },
  setFormationFormData: () => {},
  setErrorMap: () => {},
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
  const [errorMap, setErrorMap] = useState<FormationFieldErrorMap>(createFormationFieldErrorMap());
  const [showRequiredFieldsError, setShowRequiredFieldsError] = useState<boolean>(false);

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

  const requiredFieldsWithError = useMemo(() => {
    let requiredFields: FormationFields[] = [
      "businessSuffix",
      "businessAddressLine1",
      "businessAddressZipCode",
      "signer",
      "paymentType",
      "contactFirstName",
      "contactLastName",
      "contactPhoneNumber",
    ];

    if (formationFormData.agentNumberOrManual === "NUMBER") {
      requiredFields = [...requiredFields, "agentNumber"];
    }

    if (formationFormData.agentNumberOrManual === "MANUAL_ENTRY") {
      requiredFields = [
        ...requiredFields,
        "agentName",
        "agentEmail",
        "agentOfficeAddressLine1",
        "agentOfficeAddressCity",
        "agentOfficeAddressZipCode",
      ];
    }

    return requiredFields.filter((it) => errorMap[it].invalid || !formationFormData[it]);
  }, [formationFormData, errorMap]);

  const submitFormationFormData = async () => {
    if (!userData) return;

    if (requiredFieldsWithError.length > 0) {
      setShowRequiredFieldsError(true);
      const newErrorMappedFields = requiredFieldsWithError.reduce(
        (acc: FormationFieldErrorMap, cur: FormationFields) => ({ ...acc, [cur]: { invalid: true } }),
        {} as FormationFieldErrorMap
      );
      setErrorMap({ ...errorMap, ...newErrorMappedFields });
      return;
    }

    setShowRequiredFieldsError(false);
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

  if (userData?.formationData.formationResponse?.success) {
    const linkElement = (
      <a href={userData.formationData.formationResponse.redirect}>
        {BusinessFormationDefaults.alreadySubmittedLinkText}
      </a>
    );
    const splitText = templateEval(BusinessFormationDefaults.alreadySubmittedText, { link: "${link}" }).split(
      "${link}"
    );

    return (
      <div className="flex flex-column space-between minh-37">
        <div>
          <TaskHeader task={props.task} />
          <UnlockedBy taskLinks={unlockedByTaskLinks} isLoading={!taskFromRoadmap} />
          <h2>{BusinessFormationDefaults.alreadySubmittedHeader}</h2>
          <p>
            {splitText[0]}
            {linkElement}
            {splitText[1]}
          </p>
        </div>
      </div>
    );
  }

  return (
    <FormationContext.Provider
      value={{
        state: {
          formationFormData: formationFormData,
          displayContent: props.displayContent,
          errorMap: errorMap,
        },
        setFormationFormData,
        setErrorMap,
      }}
    >
      <TaskHeader task={props.task} />
      <UnlockedBy taskLinks={unlockedByTaskLinks} isLoading={!taskFromRoadmap} />
      <div data-testid="formation-form">
        <BusinessNameAndLegalStructure />
        <RegisteredAgent />
        <Signatures />
        <ContactFirstName />
        <ContactLastName />
        <ContactPhoneNumber />
        <PaymentTypeDropdown />
        <BusinessFormationDocuments />
        <BusinessFormationNotifications />
        <Content>{props.displayContent.disclaimer.contentMd}</Content>{" "}
        {userData.formationData.formationResponse &&
          !isLoading &&
          !showRequiredFieldsError &&
          userData.formationData.formationResponse.errors.length > 0 && (
            <Alert variant="error" heading={BusinessFormationDefaults.submitErrorHeading}>
              <ul>
                {userData.formationData.formationResponse.errors.map((it) => (
                  <li key={it.field}>
                    {it.field}
                    <ul>
                      <li>
                        <Content>{it.message}</Content>
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        {showRequiredFieldsError && requiredFieldsWithError.length > 0 && (
          <Alert variant="error" heading={BusinessFormationDefaults.missingFieldsOnSubmitModalText}>
            <ul>
              {requiredFieldsWithError.map((it) => (
                <li key={it}>{camelCaseToSentence(it)}</li>
              ))}
            </ul>
          </Alert>
        )}
        <div className="margin-top-2 ">
          <div className="padding-y-205 bg-base-lightest flex flex-justify-end task-submit-button-background">
            <Button loading={isLoading} style="primary" onClick={submitFormationFormData}>
              {BusinessFormationDefaults.submitButtonText}
            </Button>{" "}
          </div>
        </div>
      </div>
    </FormationContext.Provider>
  );
};
