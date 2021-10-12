import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import React, { ReactElement, useMemo } from "react";
import { PageSkeleton } from "@/components/PageSkeleton";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task } from "@/lib/types/types";
import { SidebarPageLayout } from "@/components/njwds-extended/SidebarPageLayout";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Content } from "@/components/Content";
import { useAuthProtectedPage } from "@/lib/auth/useAuthProtectedPage";
import { SearchBusinessName } from "@/components/tasks/SearchBusinessName";
import { TaskHeader } from "@/components/TaskHeader";
import { TaskCTA } from "@/components/TaskCTA";
import { getModifiedTaskContent, getUrlSlugs, rswitch } from "@/lib/utils/helpers";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NextSeo } from "next-seo";
import { NavBar } from "@/components/navbar/NavBar";
import { RadioQuestion } from "@/components/post-onboarding/RadioQuestion";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import { useRouter } from "next/router";
import { Icon } from "@/components/njwds/Icon";
//import { Unlocks } from "@/components/tasks/Unlocks";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";

interface Props {
  task: Task;
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
        <NavBar task={props.task} />
        <SidebarPageLayout task={props.task} belowOutlineBoxComponent={nextAndPreviousButtons()}>
          {rswitch(props.task.id, {
            "search-business-name": (
              <div className="margin-3">
                <SearchBusinessName task={props.task} />
              </div>
            ),
            "apply-for-shop-license": <LicenseTask task={props.task} />,
            "register-consumer-affairs": <LicenseTask task={props.task} />,
            default: (
              <div className="margin-3">
                <TaskHeader task={props.task} />
                {getUnlockedBy()}
                {getTaskContent()}
                {/* restore when #470 is decided
                <Unlocks taskLinks={taskFromRoadmap?.unlocks || []} isLoading={!taskFromRoadmap} />
                */}
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
      task: loadTaskByUrlSlug(params.urlSlug),
    },
  };
};

export default TaskPage;
