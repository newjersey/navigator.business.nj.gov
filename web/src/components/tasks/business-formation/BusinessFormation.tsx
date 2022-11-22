import { Content } from "@/components/Content";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { BusinessFormationPaginator } from "@/components/tasks/business-formation/BusinessFormationPaginator";
import { BusinessFormationSteps } from "@/components/tasks/business-formation/BusinessFormationSteps";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { FormationInterimSuccessPage } from "@/components/tasks/business-formation/FormationInterimSuccessPage";
import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation, castPublicFilingLegalTypeToFormationType } from "@/lib/domain-logic/allowFormation";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
import { splitFullName } from "@/lib/domain-logic/splitFullName";
import { FormationDisplayContentMap, NameAvailability, Task } from "@/lib/types/types";
import { getModifiedTaskContent, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  createEmptyFormationFormData,
  defaultFormationLegalType,
  FormationFields,
  FormationFormData,
  getCurrentDate,
  getCurrentDateFormatted,
  PublicFilingLegalType,
} from "@businessnjgovnavigator/shared/";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

interface Props {
  task: Task;
  displayContent: FormationDisplayContentMap;
}

export const BusinessFormation = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { userData, update } = useUserData();
  const router = useRouter();

  const [formationFormData, setFormationFormData] = useState<FormationFormData>(
    createEmptyFormationFormData()
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [interactedFields, setInteractedFields] = useState<FormationFields[]>([]);
  const [showResponseAlert, setShowResponseAlert] = useState<boolean>(false);
  const [isLoadingGetFiling, setIsLoadingGetFiling] = useState<boolean>(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState<boolean>(false);
  const [businessNameAvailability, _setBusinessNameAvailability] = useState<NameAvailability | undefined>(
    undefined
  );
  const [hasBusinessNameBeenSearched, setHasBusinessNameBeenSearched] = useState<boolean>(false);
  const getCompletedFilingApiCallOccurred = useRef<boolean>(false);

  const isValidLegalStructure = allowFormation(
    userData?.profileData.legalStructureId,
    userData?.profileData.businessPersona
  );

  const setBusinessNameAvailability = (nameAvailability: NameAvailability | undefined) => {
    _setBusinessNameAvailability(nameAvailability);
    if (nameAvailability !== undefined && !hasBusinessNameBeenSearched) {
      setHasBusinessNameBeenSearched(true);
    }
  };

  const getDate = (date?: string): string => {
    return !date || parseDateWithFormat(date, "YYYY-MM-DD").isBefore(getCurrentDate())
      ? getCurrentDateFormatted("YYYY-MM-DD")
      : date;
  };

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    const splitName = splitFullName(userData.user.name);
    setFormationFormData({
      ...userData.formationData.formationFormData,
      businessName:
        userData.formationData.formationFormData.businessName ?? userData.profileData.businessName,
      businessStartDate: getDate(userData.formationData.formationFormData.businessStartDate),
      addressMunicipality: userData.profileData.municipality,
      contactFirstName: userData.formationData.formationFormData.contactFirstName || splitName.firstName,
      contactLastName: userData.formationData.formationFormData.contactLastName || splitName.lastName,
    });
  }, userData);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (checkQueryValue(router, QUERIES.completeFiling, "false")) {
      setStepIndex(LookupStepIndexByName("Review"));
      router.replace({ pathname: `/tasks/${props.task.urlSlug}` }, undefined, { shallow: true });
    }
  }, [router, router.isReady, props.task.urlSlug]);

  useEffect(() => {
    const shouldFetchCompletedFiling = (): boolean => {
      if (!userData || getCompletedFilingApiCallOccurred.current) {
        return false;
      }
      const completeFilingQueryParamExists = checkQueryValue(router, QUERIES.completeFiling, "true");
      const completedPayment = userData.formationData.completedFilingPayment;
      const noCompletedFilingExists = !userData.formationData.getFilingResponse?.success;
      return completeFilingQueryParamExists || (completedPayment && noCompletedFilingExists);
    };

    const setCompletedFilingPayment = (userData: UserData): UserData => {
      return {
        ...userData,
        formationData: { ...userData.formationData, completedFilingPayment: true },
      };
    };

    (async function fetchCompletedFiling() {
      if (!router.isReady || !userData) {
        return;
      }
      if (shouldFetchCompletedFiling()) {
        setIsLoadingGetFiling(true);
        getCompletedFilingApiCallOccurred.current = true;
        const userDataToSet = await api
          .getCompletedFiling()
          .then((newUserData) => {
            return newUserData;
          })
          .catch(() => {
            return userData;
          });

        update(setCompletedFilingPayment(userDataToSet)).then(() => {
          setIsLoadingGetFiling(false);
          router.replace({ pathname: `/tasks/${props.task.urlSlug}` }, undefined, { shallow: true });
        });
      }
    })();
  }, [router.isReady, update, router, props.task.urlSlug, userData]);

  const legalStructureId = useMemo(() => {
    return castPublicFilingLegalTypeToFormationType(
      (userData?.profileData.legalStructureId ?? defaultFormationLegalType) as PublicFilingLegalType,
      userData?.profileData.businessPersona
    );
  }, [userData?.profileData.businessPersona, userData?.profileData.legalStructureId]);

  const setFieldInteracted = (field: FormationFields, config?: { setToUninteracted: boolean }) => {
    setInteractedFields((prevState) => {
      const prevStateFieldRemoved = prevState.filter((it) => {
        return it !== field;
      });
      if (config?.setToUninteracted) {
        return [...prevStateFieldRemoved];
      }
      return [...prevStateFieldRemoved, field];
    });
  };

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

  const errorFetchingFilings =
    userData?.formationData.completedFilingPayment &&
    !isLoadingGetFiling &&
    getCompletedFilingApiCallOccurred.current &&
    !userData.formationData.getFilingResponse?.success;

  if (errorFetchingFilings) {
    return (
      <div className="flex flex-column minh-38">
        <TaskHeader task={props.task} />
        <FormationInterimSuccessPage taskUrlSlug={props.task.urlSlug} setStepIndex={setStepIndex} />
      </div>
    );
  }

  if (isLoadingGetFiling) {
    return (
      <div className="flex flex-column minh-38">
        <TaskHeader task={props.task} />
        <div className="margin-top-6">
          <LoadingIndicator />
        </div>
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
          stepIndex: stepIndex,
          legalStructureId: legalStructureId,
          formationFormData: formationFormData,
          displayContent: props.displayContent[legalStructureId],
          showResponseAlert: showResponseAlert,
          interactedFields,
          hasBeenSubmitted,
          businessNameAvailability,
          hasBusinessNameBeenSearched,
        },
        setFormationFormData,
        setStepIndex,
        setShowResponseAlert,
        setFieldInteracted,
        setHasBeenSubmitted,
        setBusinessNameAvailability,
      }}
    >
      <div className="flex flex-column  minh-38">
        <div>
          <TaskHeader task={props.task} />
          {stepIndex === 0 && (
            <>
              <UnlockedBy task={props.task} dataTestid="dependency-alert" />
              <div className="margin-bottom-2">
                <Content>{props.displayContent[legalStructureId].introParagraph.contentMd}</Content>
              </div>
            </>
          )}
        </div>
        <BusinessFormationPaginator>{BusinessFormationSteps[stepIndex].component}</BusinessFormationPaginator>
      </div>
    </BusinessFormationContext.Provider>
  );
};
