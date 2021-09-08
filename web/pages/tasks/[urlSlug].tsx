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

interface Props {
  task: Task;
}

const TaskPage = (props: Props): ReactElement => {
  useAuthProtectedPage();

  const router = useRouter();

  const { roadmap } = useRoadmap();
  const { previousUrlSlug, nextUrlSlug } = useMemo(() => {
    const arrayOfTasks = getUrlSlugs(roadmap);
    const currentUrlSlugIndex = arrayOfTasks.indexOf(props.task.urlSlug);
    return {
      previousUrlSlug: arrayOfTasks[currentUrlSlugIndex - 1],
      nextUrlSlug: arrayOfTasks[currentUrlSlugIndex + 1],
    };
  }, [props.task.urlSlug, roadmap]);

  const nextAndPreviousButtons = (): ReactElement => (
    <div className="flex flex-row margin-top-2 padding-right-1">
      {previousUrlSlug && (
        <button
          className="flex-half flex-row usa-button usa-button--outline flex-align-center padding-y-105"
          onClick={() => router.push(`/tasks/${previousUrlSlug}`)}
        >
          <div className="flex padding-y-1 flex-justify-center">
            <Icon className="usa-icon--size-4 position-absolute left-2 bottom-105">navigate_before</Icon>
            <span> {TaskDefaults.previousTaskButtonText}</span>
          </div>
        </button>
      )}
      {nextUrlSlug && (
        <button
          className="flex-half usa-button usa-button--outline padding-y-105"
          onClick={() => router.push(`/tasks/${nextUrlSlug}`)}
        >
          <div className="flex padding-y-1 flex-justify-center">
            <span>{TaskDefaults.nextTaskButtonText}</span>
            <Icon className="usa-icon--size-4 position-absolute right-2 bottom-105">navigate_next</Icon>
          </div>
        </button>
      )}
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
                {getTaskContent()}
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
