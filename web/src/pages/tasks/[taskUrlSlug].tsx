import { NavBar } from "@/components/navbar/NavBar";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { PageSkeleton } from "@/components/PageSkeleton";
import { TaskBody } from "@/components/TaskBody";
import { BusinessFormation } from "@/components/tasks/business-formation/BusinessFormation";
import { BusinessStructureTask } from "@/components/tasks/business-structure/BusinessStructureTask";
import { CannabisApplyForLicenseTask } from "@/components/tasks/cannabis/CannabisApplyForLicenseTask";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { EinTask } from "@/components/tasks/EinTask";
import { LicenseTask } from "@/components/tasks/LicenseTask";
import { NaicsCodeTask } from "@/components/tasks/NaicsCodeTask";
import { TaxTask } from "@/components/tasks/TaxTask";
import { TaskSidebarPageLayout } from "@/components/TaskSidebarPageLayout";
import { MunicipalitiesContext } from "@/contexts/municipalitiesContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { allowFormation } from "@/lib/domain-logic/allowFormation";
import { loadTasksDisplayContent } from "@/lib/static/loadDisplayContent";
import { loadAllMunicipalities } from "@/lib/static/loadMunicipalities";
import { loadAllTaskUrlSlugs, loadTaskByUrlSlug, TaskUrlSlugParam } from "@/lib/static/loadTasks";
import { Task, TasksDisplayContent } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { getTaskFromRoadmap, getUrlSlugs } from "@/lib/utils/roadmap-helpers";
import {
  businessStructureTaskId,
  formationTaskId,
  hasCompletedBusinessStructure,
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";

interface Props {
  task: Task;
  displayContent: TasksDisplayContent;
  municipalities: Municipality[];
}

const TaskPage = (props: Props): ReactElement => {
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

  const renderNextAndPreviousButtons = (): ReactElement | undefined => {
    const isValidLegalStructure = allowFormation(business?.profileData.legalStructureId);
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
            style="default"
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
            style="default"
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
            "search-business-name": (
              <BusinessFormation
                task={getTaskFromRoadmap(roadmap, props.task.id)}
                displayContent={props.displayContent}
              />
            ),
            [formationTaskId]: (
              <BusinessFormation
                task={getTaskFromRoadmap(roadmap, props.task.id)}
                displayContent={props.displayContent}
              />
            ),
            default: <TaskBody task={props.task} />,
          })}
        </TaskSidebarPageLayout>
      </PageSkeleton>
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
    },
  };
};

export default TaskPage;
