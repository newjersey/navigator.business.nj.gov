import { Content } from "@/components/Content";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { TaskHeader } from "@/components/TaskHeader";
import { isBusinessStartDateValid } from "@/components/tasks/business-formation/business/BusinessDateValidators";
import { BusinessFormationPaginator } from "@/components/tasks/business-formation/BusinessFormationPaginator";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { FormationInterimSuccessPage } from "@/components/tasks/business-formation/FormationInterimSuccessPage";
import { NexusFormationFlow } from "@/components/tasks/business-formation/NexusFormationFlow";
import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation } from "@/lib/domain-logic/allowFormation";
import { checkQueryValue, QUERIES } from "@/lib/domain-logic/routes";
import { splitFullName } from "@/lib/domain-logic/splitFullName";
import { Task, TasksDisplayContent } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import {
  castPublicFilingLegalTypeToFormationType,
  createEmptyFormationFormData,
  defaultDateFormat,
  defaultFormationLegalType,
  FieldsForErrorHandling,
  foreignLegalTypePrefix,
  FormationFormData,
  FormationLegalType,
  getCurrentDateInNewJerseyFormatted,
  InputFile,
  NameAvailability,
  PublicFilingLegalType,
} from "@businessnjgovnavigator/shared/";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/domain-logic/getCurrentBusiness";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useMemo, useRef, useState } from "react";

interface Props {
  task: Task | undefined;
  displayContent: TasksDisplayContent;
}

export const BusinessFormation = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { updateQueue, business, userData } = useUserData();
  const router = useRouter();
  const { Config } = useConfig();

  const [formationFormData, setFormationFormData] = useState<FormationFormData>(
    createEmptyFormationFormData()
  );
  const [stepIndex, setStepIndex] = useState(0);
  const [interactedFields, setInteractedFields] = useState<FieldsForErrorHandling[]>([]);
  const [showResponseAlert, setShowResponseAlert] = useState<boolean>(false);
  const [isLoadingGetFiling, setIsLoadingGetFiling] = useState<boolean>(false);
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState<boolean>(false);
  const [hasSetStateFirstTime, setHasSetStateFirstTime] = useState<boolean>(false);
  const getCompletedFilingApiCallOccurred = useRef<boolean>(false);
  const [businessNameAvailability, setBusinessNameAvailability] = useState<NameAvailability | undefined>(
    undefined
  );
  const [dbaBusinessNameAvailability, setDbaBusinessNameAvailability] = useState<
    NameAvailability | undefined
  >(undefined);
  const [foreignGoodStandingFile, setForeignGoodStandingFile] = useState<InputFile | undefined>(undefined);

  const legalStructureId: FormationLegalType = useMemo(() => {
    return castPublicFilingLegalTypeToFormationType(
      (business?.profileData.legalStructureId ?? defaultFormationLegalType) as PublicFilingLegalType,
      business?.profileData.businessPersona
    );
  }, [business?.profileData.businessPersona, business?.profileData.legalStructureId]);

  const isForeign = useMemo(() => legalStructureId.includes(foreignLegalTypePrefix), [legalStructureId]);

  const isValidLegalStructure = useMemo(
    () => allowFormation(business?.profileData.legalStructureId, business?.profileData.businessPersona),
    [business?.profileData.legalStructureId, business?.profileData.businessPersona]
  );

  const getBusinessStartDate = (date: string | undefined, legalType: FormationLegalType): string => {
    return !date || !isBusinessStartDateValid(date, legalType)
      ? getCurrentDateInNewJerseyFormatted(defaultDateFormat)
      : date;
  };

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    const business = getCurrentBusiness(userData);

    const splitName = splitFullName(userData.user.name);
    setFormationFormData({
      ...business.formationData.formationFormData,
      businessName:
        business.formationData.formationFormData.businessName ?? business.profileData.businessName,
      businessStartDate: getBusinessStartDate(
        business.formationData.formationFormData.businessStartDate,
        legalStructureId
      ),
      addressMunicipality: business.formationData.formationFormData.addressMunicipality,
      legalType: legalStructureId,
      contactFirstName: business.formationData.formationFormData.contactFirstName || splitName.firstName,
      contactLastName: business.formationData.formationFormData.contactLastName || splitName.lastName,
      businessLocationType: isForeign
        ? business.formationData.formationFormData.businessLocationType ?? "US"
        : "NJ",
    });
    if (business.formationData.businessNameAvailability) {
      setBusinessNameAvailability({
        ...business.formationData.businessNameAvailability,
      });
    }
    if (business.formationData.dbaBusinessNameAvailability) {
      setDbaBusinessNameAvailability({
        ...business.formationData.dbaBusinessNameAvailability,
      });
    }

    setHasSetStateFirstTime(true);
  }, userData);

  useEffect(() => {
    if (!router?.isReady) {
      return;
    }
    if (checkQueryValue(router, QUERIES.completeFiling, "false")) {
      setStepIndex(LookupStepIndexByName("Review"));
      router.replace({ pathname: `/tasks/${props.task?.urlSlug}` }, undefined, { shallow: true });
    }
  }, [router, router?.isReady, props.task?.urlSlug]);

  useEffect(() => {
    const shouldFetchCompletedFiling = (): boolean => {
      if (!business || getCompletedFilingApiCallOccurred.current) {
        return false;
      }
      const completeFilingQueryParamExists = checkQueryValue(router, QUERIES.completeFiling, "true");
      const completedPayment = business.formationData.formationResponse?.success === true;
      const noCompletedFilingExists = !business.formationData.getFilingResponse?.success;
      return completeFilingQueryParamExists || (completedPayment && noCompletedFilingExists);
    };

    (async function fetchCompletedFiling(): Promise<void> {
      if (!router?.isReady || !business || !updateQueue) {
        return;
      }
      if (shouldFetchCompletedFiling()) {
        setIsLoadingGetFiling(true);
        getCompletedFilingApiCallOccurred.current = true;
        await api
          .getCompletedFiling()
          .then((newUserData) => {
            updateQueue.queue(newUserData);
          })
          .catch(() => {});

        updateQueue
          .queueFormationData({
            completedFilingPayment: true,
          })
          .update()
          .then(() => {
            setIsLoadingGetFiling(false);
            router.replace({ pathname: `/tasks/${props.task?.urlSlug}` }, undefined, { shallow: true });
          });
      }
    })();
  }, [router?.isReady, updateQueue, router, props.task?.urlSlug, business]);

  if (!props.task) return <></>;

  const setFieldsInteracted = (
    fields: FieldsForErrorHandling[],
    config?: { setToUninteracted: boolean }
  ): void => {
    setInteractedFields((prevState) => {
      const prevStateFieldRemoved = prevState.filter((it) => {
        return !fields.includes(it);
      });
      if (config?.setToUninteracted) {
        return [...prevStateFieldRemoved];
      }
      return [...prevStateFieldRemoved, ...fields];
    });
  };

  if (!isValidLegalStructure && business?.profileData.businessPersona !== "FOREIGN") {
    return (
      <div className="flex flex-column space-between minh-38">
        <div>
          <TaskHeader task={props.task} />
          <UnlockedBy task={props.task} />
          <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
        </div>
        {getModifiedTaskContent(roadmap, props.task, "callToActionLink") &&
          getModifiedTaskContent(roadmap, props.task, "callToActionText") && (
            <SingleCtaLink
              link={getModifiedTaskContent(roadmap, props.task, "callToActionLink")}
              text={getModifiedTaskContent(roadmap, props.task, "callToActionText")}
            />
          )}
      </div>
    );
  }

  const errorFetchingFilings =
    business?.formationData.completedFilingPayment &&
    !isLoadingGetFiling &&
    getCompletedFilingApiCallOccurred.current &&
    !business.formationData.getFilingResponse?.success;

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
        <PageCircularIndicator />
      </div>
    );
  }

  if (business?.formationData.getFilingResponse?.success) {
    return (
      <div className="flex flex-column space-between minh-38">
        <TaskHeader task={props.task} />
        <FormationSuccessPage business={business} />
      </div>
    );
  }

  const getIntro = (): string => {
    if (isForeign) {
      return Config.formation.intro.foreign;
    }
    return Config.formation.intro.default;
  };

  return (
    <BusinessFormationContext.Provider
      value={{
        state: {
          stepIndex,
          formationFormData,
          businessNameAvailability,
          dbaBusinessNameAvailability,
          dbaContent: props.displayContent.formationDbaContent,
          showResponseAlert,
          interactedFields,
          hasBeenSubmitted,
          hasSetStateFirstTime,
          foreignGoodStandingFile,
        },
        setFormationFormData,
        setBusinessNameAvailability,
        setDbaBusinessNameAvailability,
        setStepIndex,
        setShowResponseAlert,
        setFieldsInteracted,
        setHasBeenSubmitted,
        setForeignGoodStandingFile,
      }}
    >
      <div className="flex flex-column minh-38" data-testid="formation-form">
        <>
          <div>
            <TaskHeader task={props.task} />
            {stepIndex === 0 && (
              <>
                <UnlockedBy task={props.task} dataTestid="dependency-alert" />
                <div className="margin-bottom-2">
                  <Content>{getIntro()}</Content>
                </div>
              </>
            )}
          </div>
          {isForeign ? <NexusFormationFlow /> : <BusinessFormationPaginator />}
        </>
      </div>
    </BusinessFormationContext.Provider>
  );
};
