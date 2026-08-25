import { LearnTaskSidebarPageLayout } from "@/components/LearnTaskSidebarPageLayout";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import analytics from "@/lib/utils/analytics";
import { getMergedConfig, type ConfigType } from "@businessnjgovnavigator/shared";
import { GetStaticPaths, GetStaticProps } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  learnStep: LearnStep;
}

type LearnStep = ConfigType["learnPages"]["steps"][number];

const LearnTaskPage = (props: Props): ReactElement => {
  const router = useRouter();
  const { Config } = useConfig();
  const learnSteps = Config.learnPages.steps;

  const getNextAndPreviousButtons = (): ReactElement | undefined => {
    const currentTaskIndex = learnSteps.findIndex((task) => task.id === props.learnStep.id);
    const previousTask = learnSteps[currentTaskIndex - 1];
    const nextTask = learnSteps[currentTaskIndex + 1];

    return (
      <div
        className={`flex flex-row ${
          previousTask ? "flex-justify" : "flex-justify-end"
        } margin-top-2`}
      >
        {previousTask && (
          <Link
            className="usa-button usa-button--unstyled width-auto font-weight-inherit font-size-inherit"
            href={`/learn/${previousTask.id}`}
          >
            <span className="display-flex flex-row flex-justify-center flex-align-center">
              <Icon className="usa-icon--size-4" iconName="navigate_before" />
              <span className="margin-left-2">{Config.learnPages.previousStepText}</span>
            </span>
          </Link>
        )}
        {nextTask && (
          <Link
            className="usa-button usa-button--unstyled width-auto font-weight-inherit font-size-inherit"
            href={`/learn/${nextTask.id}`}
          >
            <span className="display-flex flex-row flex-justify-center flex-align-center">
              <span className="margin-right-2">{Config.learnPages.nextStepText}</span>
              <Icon className="usa-icon--size-4" iconName="navigate_next" />
            </span>
          </Link>
        )}
      </div>
    );
  };
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.learnStep.name || "")} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <LearnTaskSidebarPageLayout
          taskId={props.learnStep.id}
          belowBoxComponent={getNextAndPreviousButtons()}
        >
          <h1>
            {`${Config.learnPages.stepText} ${learnSteps.findIndex((step) => step.id === props.learnStep.id) + 1}`}
          </h1>
          <h2>{props.learnStep.name}</h2>
          <p>{Config.learnPages.placeholderContent}</p>

          <div className="display-flex flex-justify-end margin-top-2">
            <button
              className="usa-button usa-button--primary display-flex flex-align-center text-left text-normal"
              data-testid="open-account-button"
              type="button"
              onClick={(): void => {
                analytics.event.learn_page.click.account_setup(props.learnStep.id);
                router && router.push("/account-setup/");
              }}
            >
              <span>
                <span className="display-block text-bold padding-bottom-1">
                  {Config.learnPages.accountButtonHeading}
                </span>
                <span className="display-block">{Config.learnPages.accountButtonText}</span>
              </span>
              <Icon className="usa-icon--size-4 margin-left-3" iconName="navigate_next" />
            </button>
          </div>
        </LearnTaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = () => {
  const learnSteps = getMergedConfig().learnPages.steps;

  return {
    paths: learnSteps.map((task) => ({
      params: { taskUrlSlug: task.id },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = ({ params }) => {
  const taskUrlSlug = params?.taskUrlSlug;

  if (typeof taskUrlSlug !== "string") {
    return { notFound: true };
  }

  const learnStep = getMergedConfig().learnPages.steps.find((task) => task.id === taskUrlSlug);

  if (!learnStep) {
    return { notFound: true };
  }

  return {
    props: {
      learnStep,
    },
  };
};

export default LearnTaskPage;
