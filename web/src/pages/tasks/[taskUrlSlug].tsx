import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RadioQuestion } from "@/components/post-onboarding/RadioQuestion";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { allowFormation, BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { loadTasksDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task, TasksDisplayContent } from "@/lib/types/types";
import { getModifiedTaskContent, getUrlSlugs, rswitch } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Municipality } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import React, { ReactElement, ReactNode, useMemo } from "react";

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
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const nextAndPreviousButtons = (): ReactElement => (
    <div
      className={`flex ${isTabletAndUp ? "flex-row padding-right-1" : "flex-column"} margin-top-2 `}
      data-testid="nextAndPreviousButtons"
    >
      <button
        className={`${
          isTabletAndUp ? "" : "margin-bottom-2 margin-right-0"
        } flex-half flex-row usa-button usa-button--outline flex-align-center padding-y-105`}
        style={{ visibility: previousUrlSlug ? "visible" : "hidden" }}
        onClick={() => router.push(`/tasks/${previousUrlSlug}`)}
      >
        <div className="flex flex-justify">
          <Icon className="usa-icon--size-4">navigate_before</Icon>
          <span className="flex-align-self-center"> {Config.taskDefaults.previousTaskButtonText}</span>
          <Icon className="usa-icon--size-4 visibility-hidden"> </Icon>
        </div>
      </button>
      <button
        className={`flex-half usa-button usa-button--outline padding-y-105 ${
          isTabletAndUp ? "" : "margin-right-0"
        }`}
        style={{ visibility: nextUrlSlug ? "visible" : "hidden" }}
        onClick={() => router.push(`/tasks/${nextUrlSlug}`)}
      >
        <div className="flex flex-justify">
          <Icon className="usa-icon--size-4 visibility-hidden"> </Icon>
          <span className="flex-align-self-center">{Config.taskDefaults.nextTaskButtonText}</span>
          <Icon className="usa-icon--size-4">navigate_next</Icon>
        </div>
      </button>
    </div>
  );

  const getTaskBody = (): ReactElement => {
    const task = {
      ...props.task,
      contentMd: getModifiedTaskContent(roadmap, props.task, "contentMd"),
      callToActionLink: getModifiedTaskContent(roadmap, props.task, "callToActionLink"),
      callToActionText: getModifiedTaskContent(roadmap, props.task, "callToActionText"),
    };
    return <TaskElement task={task}>{<UnlockedBy task={props.task} />}</TaskElement>;
  };

  const businessFormationFeatureFlag = (): ReactElement => {
    return (
      <BusinessFormation
        task={props.task}
        displayContent={props.displayContent.formationDisplayContent}
        municipalities={props.municipalities}
      />
    );
  };

  const renderNextAndPreviousButtons = () => {
    const isValidLegalStructure = allowFormation(userData?.profileData.legalStructureId);
    if (props.task.id === "form-business-entity" && isValidLegalStructure) return;
    return nextAndPreviousButtons();
  };

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.task.name}`} />
      <PageSkeleton>
        <NavBar task={props.task} sidebarPageLayout={true} />
        <TaskSidebarPageLayout task={props.task} belowBoxComponent={renderNextAndPreviousButtons()}>
          {rswitch(props.task.id, {
            "search-business-name": <SearchBusinessName task={props.task} />,
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
            "pharmacy-license": <LicenseTask task={props.task} />,
            "license-accounting": <LicenseTask task={props.task} />,
            "license-massage-therapy": <LicenseTask task={props.task} />,
            "form-business-entity": businessFormationFeatureFlag(),
            "determine-naics-code": <NaicsCodeTask task={props.task} />,
            "priority-status-cannabis": (
              <CannabisPriorityStatusTask
                task={props.task}
                displayContent={props.displayContent.cannabisPriorityStatusDisplayContent}
              />
            ),
            "conditional-permit-cannabis": (
              <CannabisApplyForLicenseTask
                task={props.task}
                displayContent={props.displayContent.cannabisApplyForLicenseDisplayContent}
              />
            ),
            "annual-license-cannabis": (
              <CannabisApplyForLicenseTask
                task={props.task}
                displayContent={props.displayContent.cannabisApplyForLicenseDisplayContent}
              />
            ),
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
