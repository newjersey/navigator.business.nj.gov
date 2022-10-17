import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RadioQuestion } from "@/components/post-onboarding/RadioQuestion";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { allowFormation, BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { EinTask } from "@/components/tasks/EinTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { NexusFormationTask } from "@/components/tasks/NexusFormationTask";
import { NexusSearchBusinessNameTask } from "@/components/tasks/search-business-name/NexusSearchBusinessNameTask";
import { SearchBusinessNameTask } from "@/components/tasks/search-business-name/SearchBusinessNameTask";
import { TaxTask } from "@/components/tasks/TaxTask";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { loadTasksDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task, TasksDisplayContent } from "@/lib/types/types";
import {
  getModifiedTaskContent,
  getTaskFromRoadmap,
  getUrlSlugs,
  rswitch,
  templateEval,
} from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { formationTaskId, Municipality } from "@businessnjgovnavigator/shared/";
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

  const renderNextAndPreviousButtons = () => {
    const isValidLegalStructure = allowFormation(userData?.profileData.legalStructureId);
    const isStarting = userData?.profileData.businessPersona === "STARTING";
    if (props.task.id === formationTaskId && isValidLegalStructure && isStarting) return;
    return (
      <div
        className={`flex flex-row ${previousUrlSlug ? "flex-justify" : "flex-justify-end"} margin-top-2 `}
        data-testid="nextAndPreviousButtons"
      >
        {previousUrlSlug && (
          <Button style="tertiary" onClick={() => router.push(`/tasks/${previousUrlSlug}`)}>
            <Icon className="usa-icon--size-4">navigate_before</Icon>
            <span className="margin-left-2"> {Config.taskDefaults.previousTaskButtonText}</span>
          </Button>
        )}
        {nextUrlSlug && (
          <Button style="tertiary" onClick={() => router.push(`/tasks/${nextUrlSlug}`)}>
            <span className="margin-right-2">{Config.taskDefaults.nextTaskButtonText}</span>
            <Icon className="usa-icon--size-4">navigate_next</Icon>
          </Button>
        )}
      </div>
    );
  };

  const renderFormationTask = (): ReactElement => {
    const taskInRoadmap = getTaskFromRoadmap(roadmap, props.task.id);
    if (!taskInRoadmap) return <></>;

    if (userData?.profileData.businessPersona === "FOREIGN") {
      return <NexusFormationTask task={taskInRoadmap} />;
    } else {
      return (
        <BusinessFormation
          task={taskInRoadmap}
          displayContent={props.displayContent.formationDisplayContent}
          municipalities={props.municipalities}
        />
      );
    }
  };

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.task.name}`} />
      <PageSkeleton>
        <NavBar task={props.task} sidebarPageLayout={true} />
        <TaskSidebarPageLayout task={props.task} belowBoxComponent={renderNextAndPreviousButtons()}>
          {rswitch(props.task.id, {
            "search-business-name": <SearchBusinessNameTask task={props.task} />,
            "search-business-name-nexus": <NexusSearchBusinessNameTask task={props.task} />,
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
            "pharmacy-license": <LicenseTask task={props.task} />,
            "license-accounting": <LicenseTask task={props.task} />,
            "license-massage-therapy": <LicenseTask task={props.task} />,
            "determine-naics-code": <NaicsCodeTask task={props.task} />,
            "priority-status-cannabis": <CannabisPriorityStatusTask task={props.task} />,
            "conditional-permit-cannabis": <CannabisApplyForLicenseTask task={props.task} />,
            "annual-license-cannabis": <CannabisApplyForLicenseTask task={props.task} />,
            "register-for-ein": <EinTask task={props.task} />,
            "register-for-taxes": <TaxTask task={getTaskFromRoadmap(roadmap, props.task.id) ?? props.task} />,
            [formationTaskId]: renderFormationTask(),
            default: getTaskBody(),
          })}
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

const getPostOnboardingQuestion = (task: Task): ReactElement => {
  if (!task.postOnboardingQuestion) return <></>;
  return rswitch(task.postOnboardingQuestion, {
    "construction-renovation": (
      <RadioQuestion id="construction-renovation" onboardingKey="constructionRenovationPlan" />
    ),
    default: <></>,
  });
};

export const TaskElement = (props: { task: Task; children?: ReactNode | ReactNode[] }) => {
  const [beforeQuestion, afterQuestion] = props.task.contentMd.split("{postOnboardingQuestion}");

  return (
    <div id="taskElement" className="flex flex-column space-between minh-38">
      <div>
        <TaskHeader task={props.task} />
        {props.children}
        <Content>{beforeQuestion}</Content>
        {getPostOnboardingQuestion(props.task)}
        <Content>{afterQuestion}</Content>
        {props.task.issuingAgency || props.task.formName ? (
          <>
            <hr className="margin-y-3" />
            {props.task.issuingAgency ? (
              <div>
                <span className="h5-styling">{`${Config.taskDefaults.issuingAgencyText}: `}</span>
                <span className="h6-styling">{props.task.issuingAgency}</span>
              </div>
            ) : null}
            {props.task.formName ? (
              <div>
                <span className="h5-styling">{`${Config.taskDefaults.formNameText}: `}</span>
                <span className="h6-styling">{props.task.formName}</span>
              </div>
            ) : null}
          </>
        ) : null}
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

export const getStaticProps = async ({
  params,
}: {
  params: TaskUrlSlugParam;
}): Promise<GetStaticPropsResult<Props>> => {
  const municipalities = await loadAllMunicipalities();
  return {
    props: {
      task: loadTaskByUrlSlug(params.taskUrlSlug),
      displayContent: loadTasksDisplayContent(),
      municipalities,
    },
  };
};

export default TaskPage;
