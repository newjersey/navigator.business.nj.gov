import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { AnytimeActionGovernmentContractingElement } from "@/components/tasks/anytime-action/AnytimeActionGovernmentContractingElement";
import { GovernmentContractingSteps } from "@/components/tasks/government-contracting/GovernmentContractingSteps";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { loadAnytimeActionTaskByUrlSlug } from "@/lib/static/loadAnytimeActionTasks";
import { AnytimeActionTask } from "@/lib/types/types";
import { GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { ReactElement } from "react";

interface Props {
  governmentContractingStepAnytimeActions: AnytimeActionTask[];
  governmentContractingTask: AnytimeActionTask;
}

const AnytimeActionTaskPage = (props: Props): ReactElement => {
  return (
    <>
      <NextSeo title={getNextSeoTitle(props.governmentContractingTask.name)} />
      <PageSkeleton showNavBar showSidebar hideMiniRoadmap>
        <TaskSidebarPageLayout hideMiniRoadmap={true}>
          <AnytimeActionGovernmentContractingElement
            governmentContractingStepAnytimeActions={props.governmentContractingStepAnytimeActions}
            governmentContractingTask={props.governmentContractingTask}
          />
        </TaskSidebarPageLayout>
      </PageSkeleton>
    </>
  );
};

export const getStaticProps = (): GetStaticPropsResult<Props> => {
  const GovernmentContractingStepsAnytimeActions = GovernmentContractingSteps.map((current) => {
    return loadAnytimeActionTaskByUrlSlug(current.fileName);
  });

  return {
    props: {
      governmentContractingStepAnytimeActions: GovernmentContractingStepsAnytimeActions,
      governmentContractingTask: loadAnytimeActionTaskByUrlSlug("government-contracting"),
    },
  };
};

export default AnytimeActionTaskPage;
