import { Content } from "@/components/Content";
import { NavBar } from "@/components/navbar/NavBar";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { RadioQuestion } from "@/components/post-onboarding/RadioQuestion";
import { TaskCTA } from "@/components/TaskCTA";
import { TaskHeader } from "@/components/TaskHeader";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { TaskDefaults } from "@/display-defaults/tasks/TaskDefaults";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { loadFilingsReferences } from "@/lib/static/loadFilings";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { FilingReference, Task } from "@/lib/types/types";
import { getModifiedTaskContent, getUrlSlugs, rswitch } from "@/lib/utils/helpers";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import React, { ReactElement, useMemo } from "react";

interface Props {
  task: Task;
  filingsReferences: Record<string, FilingReference>;
}

const TaskPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

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
  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);

  const getUnlockedBy = (): ReactElement => {
    const unlockedByTaskLinks = taskFromRoadmap
      ? taskFromRoadmap.unlockedBy.filter((it) => userData?.taskProgress[it.id] !== "COMPLETED")
      : [];

    return <UnlockedBy taskLinks={unlockedByTaskLinks} isLoading={!taskFromRoadmap} />;
  };

  const nextAndPreviousButtons = (): ReactElement => (
    <div className="flex flex-row margin-top-2 padding-right-1">
      <button
        className="flex-half flex-row usa-button usa-button--outline flex-align-center padding-y-105"
        style={{ visibility: previousUrlSlug ? "visible" : "hidden" }}
        onClick={() => router.push(`/tasks/${previousUrlSlug}`)}
      >
        <div className="flex flex-justify">
          <Icon className="usa-icon--size-4">navigate_before</Icon>
          <span className="flex-align-self-center"> {TaskDefaults.previousTaskButtonText}</span>
          <Icon className="usa-icon--size-4 visibility-hidden"> </Icon>
        </div>
      </button>
      <button
        className="flex-half usa-button usa-button--outline padding-y-105"
        style={{ visibility: nextUrlSlug ? "visible" : "hidden" }}
        onClick={() => router.push(`/tasks/${nextUrlSlug}`)}
      >
        <div className="flex flex-justify">
          <Icon className="usa-icon--size-4 visibility-hidden"> </Icon>
          <span className="flex-align-self-center">{TaskDefaults.nextTaskButtonText}</span>
          <Icon className="usa-icon--size-4">navigate_next</Icon>
        </div>
      </button>
    </div>
  );

  const getPostOnboardingQuestion = (): ReactElement => {
    if (!props.task.postOnboardingQuestion) return <></>;
    return rswitch(props.task.postOnboardingQuestion, {
      "construction-renovation": (
        <RadioQuestion id="construction-renovation" onboardingKey="constructionRenovationPlan" />
      ),
      default: <></>,
    });
  };

  const getTaskContent = (): ReactElement => {
    const content = getModifiedTaskContent(roadmap, props.task, "contentMd");
    const [beforeQuestion, afterQuestion] = content.split("{postOnboardingQuestion}");
    return (
      <>
        <Content>{beforeQuestion}</Content>
        {getPostOnboardingQuestion()}
        <Content>{afterQuestion}</Content>
      </>
    );
  };

  return (
    <>
      <NextSeo title={`Business.NJ.gov Navigator - ${props.task.name}`} />
      <PageSkeleton>
        <NavBar task={props.task} sideBarPageLayout={true} filingsReferences={props.filingsReferences} />
        <SidebarPageLayout
          task={props.task}
          belowOutlineBoxComponent={nextAndPreviousButtons()}
          filingsReferences={props.filingsReferences}
        >
          {rswitch(props.task.id, {
            "search-business-name": <SearchBusinessName task={props.task} />,
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
            default: (
              <div className="flex flex-column space-between minh-37">
                <div>
                  <TaskHeader task={props.task} />
                  {getUnlockedBy()}
                  {getTaskContent()}
                </div>
                <TaskCTA
                  link={getModifiedTaskContent(roadmap, props.task, "callToActionLink")}
                  text={getModifiedTaskContent(roadmap, props.task, "callToActionText")}
                />
              </div>
            ),
          })}
        </SidebarPageLayout>
      </PageSkeleton>
    </>
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
      filingsReferences: loadFilingsReferences(),
    },
  };
};

export default TaskPage;
