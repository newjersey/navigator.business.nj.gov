import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { Icon } from "@/components/njwds/Icon";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { TaskPageSwitchComponent } from "@/components/TaskPageSwitchComponent";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { HousingMunicipalitiesContext } from "@/contexts/housingMunicipalitiesContext";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation } from "@/lib/domain-logic/allowFormation";
import { getNextSeoTitle } from "@/lib/domain-logic/getNextSeoTitle";
import { loadTasksDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllHousingMunicipalities } from "@/lib/static/loadHousingMunicipalities";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task, TasksDisplayContent } from "@/lib/types/types";
import { getUrlSlugs } from "@/lib/utils/roadmap-helpers";
import {
  businessStructureTaskId,
  formationTaskId,
  hasCompletedBusinessStructure,
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { HousingMunicipality } from "@businessnjgovnavigator/shared/housing";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";

interface Props {
  task: Task;
  displayContent: TasksDisplayContent;
  municipalities: Municipality[];
  housingMunicipalities: HousingMunicipality[];
}

const TaskPage = (props: Props): ReactElement<any> => {
  const router = useRouter();
  const { business } = useUserData();
  const { roadmap } = useRoadmap();
  const { previousUrlSlug, nextUrlSlug } = useMemo(() => {
    const arrayOfTasks = getUrlSlugs(roadmap);
    const currentUrlSlugIndex = arrayOfTasks.indexOf(props.task.urlSlug);
    return {
      previousUrlSlug: arrayOfTasks[currentUrlSlugIndex - 1],
      nextUrlSlug: arrayOfTasks[currentUrlSlugIndex + 1],
    };
  }, [props.task.urlSlug, roadmap]);
  const { Config } = useConfig();
  const renderLoadingState = !business || !roadmap;

  const renderNextAndPreviousButtons = (): ReactElement<any> | undefined => {
    const isValidLegalStructure = allowFormation(
      business?.profileData.legalStructureId,
      business?.profileData.businessPersona
    );
    if (props.task.id === formationTaskId && isValidLegalStructure) {
      return undefined;
    }

    const hideNextUrlSlug =
      props.task.id === businessStructureTaskId && !hasCompletedBusinessStructure(business);

    return (
      <div
        className={`flex flex-row ${previousUrlSlug ? "flex-justify" : "flex-justify-end"} margin-top-2 `}
        data-testid="nextAndPreviousButtons"
      >
        {previousUrlSlug && (
          <UnStyledButton
            onClick={(): void => {
              router.push(`/tasks/${previousUrlSlug}`);
            }}
          >
            <Icon className="usa-icon--size-4" iconName="navigate_before" />
            <span className="margin-left-2"> {Config.taskDefaults.previousTaskButtonText}</span>
          </UnStyledButton>
        )}
        {nextUrlSlug && !hideNextUrlSlug && (
          <UnStyledButton
            dataTestid={"nextUrlSlugButton"}
            onClick={(): void => {
              router.push(`/tasks/${nextUrlSlug}`);
            }}
          >
            <span className="margin-right-2">{Config.taskDefaults.nextTaskButtonText}</span>
            <Icon className="usa-icon--size-4" iconName="navigate_next" />
          </UnStyledButton>
        )}
      </div>
    );
  };

  return (
    <MunicipalitiesContext.Provider value={{ municipalities: props.municipalities }}>
      <HousingMunicipalitiesContext.Provider value={{ municipalities: props.housingMunicipalities }}>
        <NextSeo title={getNextSeoTitle(props.task.name)} />
        <PageSkeleton showNavBar showSidebar task={props.task}>
          <TaskSidebarPageLayout task={props.task} belowBoxComponent={renderNextAndPreviousButtons()}>
            {renderLoadingState && <PageCircularIndicator />}
            {!renderLoadingState && (
              <TaskPageSwitchComponent
                task={props.task}
                business={business}
                displayContent={props.displayContent}
                roadmap={roadmap}
              />
            )}
          </TaskSidebarPageLayout>
        </PageSkeleton>
      </HousingMunicipalitiesContext.Provider>
    </MunicipalitiesContext.Provider>
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
      housingMunicipalities: loadAllHousingMunicipalities(),
    },
  };
};

export default TaskPage;
