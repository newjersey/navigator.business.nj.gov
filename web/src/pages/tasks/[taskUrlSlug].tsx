import { Content } from "@/components/Content";
import { DeferredLocationQuestion } from "@/components/DeferredLocationQuestion";
import { NavBar } from "@/components/navbar/NavBar";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RadioQuestion } from "@/components/post-onboarding/RadioQuestion";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { EinTask } from "@/components/tasks/EinTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { TaxTask } from "@/components/tasks/TaxTask";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation } from "@/lib/domain-logic/allowFormation";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { ROUTES } from "@/lib/domain-logic/routes";
import { loadTasksDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task, TasksDisplayContent } from "@/lib/types/types";
import { rswitch, templateEval } from "@/lib/utils/helpers";
import { getModifiedTaskContent, getTaskFromRoadmap, getUrlSlugs } from "@/lib/utils/roadmap-helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import {
  formationTaskId,
  hasCompletedBusinessStructure,
  Municipality,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { LookupTaskAgencyById } from "@businessnjgovnavigator/shared/taskAgency";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useMemo } from "react";

interface Props {
  task: Task;
  displayContent: TasksDisplayContent;
  municipalities: Municipality[];
}

const TaskPage = (props: Props): ReactElement => {
  const router = useRouter();
  const { userData } = useUserData();
  const { roadmap } = useRoadmap();
  const { previousUrlSlug, nextUrlSlug } = useMemo(() => {
    const arrayOfTasks = getUrlSlugs(roadmap);
    const currentUrlSlugIndex = arrayOfTasks.indexOf(props.task.urlSlug);
    return {
      previousUrlSlug: arrayOfTasks[currentUrlSlugIndex - 1],
      nextUrlSlug: arrayOfTasks[currentUrlSlugIndex + 1],
    };
  }, [props.task.urlSlug, roadmap]);

  const addNaicsCodeData = (contentMd: string): string => {
    const naicsCode = userData?.profileData.naicsCode || "";
    const naicsTemplateValue = getNaicsDisplayMd(naicsCode);
    return templateEval(contentMd, { naicsCode: naicsTemplateValue });
  };

  const getTaskBody = (): ReactElement => {
    const task = {
      ...props.task,
      contentMd: addNaicsCodeData(getModifiedTaskContent(roadmap, props.task, "contentMd")),
      callToActionLink: getModifiedTaskContent(roadmap, props.task, "callToActionLink"),
      callToActionText: getModifiedTaskContent(roadmap, props.task, "callToActionText"),
    };
    return <TaskElement task={task}>{<UnlockedBy task={props.task} />}</TaskElement>;
  };

  const renderNextAndPreviousButtons = (): ReactElement | undefined => {
    const isValidLegalStructure = allowFormation(
      userData?.profileData.legalStructureId,
      userData?.profileData.businessPersona
    );
    if (props.task.id === formationTaskId && isValidLegalStructure) {
      return undefined;
    }

    const hideNextUrlSlug =
      router.asPath === ROUTES.businessStructureTask && !hasCompletedBusinessStructure(userData as UserData);

    return (
      <div
        className={`flex flex-row ${previousUrlSlug ? "flex-justify" : "flex-justify-end"} margin-top-2 `}
        data-testid="nextAndPreviousButtons"
      >
        {previousUrlSlug && (
          <UnStyledButton
            style="tertiary"
            onClick={(): void => {
              router.push(`/tasks/${previousUrlSlug}`);
            }}
          >
            <Icon className="usa-icon--size-4">navigate_before</Icon>
            <span className="margin-left-2"> {Config.taskDefaults.previousTaskButtonText}</span>
          </UnStyledButton>
        )}
        {nextUrlSlug && !hideNextUrlSlug && (
          <UnStyledButton
            dataTestid={"nextUrlSlugButton"}
            style="tertiary"
            onClick={(): void => {
              router.push(`/tasks/${nextUrlSlug}`);
            }}
          >
            <span className="margin-right-2">{Config.taskDefaults.nextTaskButtonText}</span>
            <Icon className="usa-icon--size-4">navigate_next</Icon>
          </UnStyledButton>
        )}
      </div>
    );
  };

  const renderFormationTask = (): ReactElement => {
    const taskInRoadmap = getTaskFromRoadmap(roadmap, props.task.id);
    if (!taskInRoadmap) {
      return <></>;
    }
    return <BusinessFormation task={taskInRoadmap} displayContent={props.displayContent} />;
  };

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.task.name}`} />
      <PageSkeleton>
        <NavBar task={props.task} showSidebar={true} />
        <TaskSidebarPageLayout task={props.task} belowBoxComponent={renderNextAndPreviousButtons()}>
          {rswitch(props.task.id, {
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
            "pharmacy-license": <LicenseTask task={props.task} />,
            "license-accounting": <LicenseTask task={props.task} />,
            "license-massage-therapy": <LicenseTask task={props.task} />,
            "moving-company-license": <LicenseTask task={props.task} />,
            "architect-license": <LicenseTask task={props.task} />,
            "hvac-license": <LicenseTask task={props.task} />,
            "appraiser-license": <LicenseTask task={props.task} />,
            "determine-naics-code": <NaicsCodeTask task={props.task} />,
            "priority-status-cannabis": <CannabisPriorityStatusTask task={props.task} />,
            "conditional-permit-cannabis": <CannabisApplyForLicenseTask task={props.task} />,
            "annual-license-cannabis": <CannabisApplyForLicenseTask task={props.task} />,
            "register-for-ein": <EinTask task={props.task} />,
            "register-for-taxes": <TaxTask task={getTaskFromRoadmap(roadmap, props.task.id) ?? props.task} />,
            "business-structure": (
              <BusinessStructureTask task={getTaskFromRoadmap(roadmap, props.task.id) ?? props.task} />
            ),
            [formationTaskId]: renderFormationTask(),
            default: getTaskBody(),
          })}
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </MunicipalitiesContext.Provider>
  );
};

const getPostOnboardingQuestion = (task: Task): ReactElement => {
  if (!task.postOnboardingQuestion) {
    return <></>;
  }
  return rswitch(task.postOnboardingQuestion, {
    "construction-renovation": (
      <RadioQuestion id="construction-renovation" onboardingKey="constructionRenovationPlan" />
    ),
    default: <></>,
  });
};

export const TaskElement = (props: { task: Task; children?: ReactNode | ReactNode[] }): ReactElement => {
  const hasPostOnboardingQuestion = !!props.task.postOnboardingQuestion;
  const shouldShowDeferredQuestion = props.task.requiresLocation;
  let hasDeferredLocationQuestion = false;

  const deferredLocationQuestion = {
    before: "",
    innerContent: "",
    after: "",
  };

  const postOnboardingQuestion = {
    before: "",
    innerContent: "",
    after: "",
  };

  if (props.task.contentMd) {
    const [beforePostOnboarding, afterPostOnboarding] =
      props.task.contentMd.split("{postOnboardingQuestion}");
    postOnboardingQuestion.before = beforePostOnboarding;
    postOnboardingQuestion.after = afterPostOnboarding;
    hasDeferredLocationQuestion =
      props.task.contentMd.includes("${beginLocationDependentSection}") &&
      props.task.contentMd.includes("${endLocationDependentSection}");

    const [beforeDeferredLocation, rest] = props.task.contentMd.split("${beginLocationDependentSection}");
    deferredLocationQuestion.before = beforeDeferredLocation;
    deferredLocationQuestion.after = rest;
    if (rest) {
      const [innerContentDeferredLocation, afterDeferredLocation] = rest.split(
        "${endLocationDependentSection}"
      );
      deferredLocationQuestion.innerContent = innerContentDeferredLocation;
      deferredLocationQuestion.after = afterDeferredLocation;
    }
  }

  const getAgencyText = (): string => {
    const agency = props.task.agencyId ? LookupTaskAgencyById(props.task.agencyId).name : "";
    const context = props.task.agencyAdditionalContext ?? "";
    if (agency && context) {
      return `${agency}, ${context}`;
    } else if (agency) {
      return agency;
    } else if (context) {
      return context;
    }
    return "";
  };

  return (
    <div id="taskElement" className="flex flex-column space-between minh-38">
      <div>
        <TaskHeader task={props.task} />
        {props.children}
        <Content>{props.task.summaryDescriptionMd || ""}</Content>

        {hasDeferredLocationQuestion && (
          <>
            <Content>{deferredLocationQuestion.before}</Content>
            {shouldShowDeferredQuestion && (
              <DeferredLocationQuestion innerContent={deferredLocationQuestion.innerContent} />
            )}
            <Content>{deferredLocationQuestion.after}</Content>
          </>
        )}

        {hasPostOnboardingQuestion && (
          <>
            <Content>{postOnboardingQuestion.before}</Content>
            {getPostOnboardingQuestion(props.task)}
            {postOnboardingQuestion.after && <Content>{postOnboardingQuestion.after}</Content>}
          </>
        )}

        {!hasPostOnboardingQuestion && !hasDeferredLocationQuestion && (
          <>
            <Content>{props.task.contentMd}</Content>
          </>
        )}

        {(props.task.agencyId || props.task.formName || props.task.agencyAdditionalContext) && (
          <hr className="margin-y-3" />
        )}

        {(props.task.agencyId || props.task.agencyAdditionalContext) && (
          <div>
            <span className="h5-styling">{`${Config.taskDefaults.issuingAgencyText}: `}</span>
            <span className="h6-styling">{getAgencyText()}</span>
          </div>
        )}
        {props.task.formName && (
          <div>
            <span className="h5-styling">{`${Config.taskDefaults.formNameText}: `}</span>
            <span className="h6-styling">{props.task.formName}</span>
          </div>
        )}
      </div>
      <TaskCTA link={props.task.callToActionLink} text={props.task.callToActionText} />
    </div>
  );
};

export const getStaticPaths = (): GetStaticPathsResult<TaskUrlSlugParam> => {
  const paths = loadAllTaskUrlSlugs();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps = ({ params }: { params: TaskUrlSlugParam }): GetStaticPropsResult<Props> => {
  return {
    props: {
      task: loadTaskByUrlSlug(params.taskUrlSlug),
      displayContent: loadTasksDisplayContent(),
      municipalities: loadAllMunicipalities(),
    },
  };
};

export default TaskPage;
