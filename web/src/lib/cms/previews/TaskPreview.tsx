import { Icon } from "@/components/njwds/Icon";
import { TaskPageSwitchComponent } from "@/components/TaskPageSwitchComponent";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateRoadmap } from "@/test/factories";
import { getIndustries } from "@businessnjgovnavigator/shared/industry";
import {
  generateBusiness,
  generateMunicipality,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import {
  createEmptyTaskDisplayContent,
  TaskWithLicenseTaskId,
} from "@businessnjgovnavigator/shared/types";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, useState } from "react";

const TaskPreview = (props: PreviewProps): ReactElement => {
  const [isOpenRoadmaps, setIsOpenRoadmaps] = useState<boolean>(false);
  const ref = usePreviewRef(props);
  const task = usePageData<TaskWithLicenseTaskId>(props);

  const fakeBusinessWithMunicipality = generateBusiness({
    profileData: generateProfileData({
      municipality: generateMunicipality({}),
      constructionRenovationPlan: true,
    }),
  });

  const displayContent = createEmptyTaskDisplayContent();
  const roadmap = generateRoadmap({});

  const applicableIndustries = getIndustries({ overrideShowDisabledIndustries: true }).filter(
    (industry) => {
      const taskIds = industry.roadmapSteps.map((step) => step.task);
      return taskIds.includes(task.id);
    },
  );

  const industryRoadmaps = (): ReactElement => {
    return (
      <Accordion
        expanded={isOpenRoadmaps}
        onChange={() => {
          setIsOpenRoadmaps(!isOpenRoadmaps);
        }}
        className="margin-left-1 margin-right-10"
      >
        <AccordionSummary
          expandIcon={
            <Icon className={"usa-icon--size-5 margin-left-1"} iconName={"expand_more"} />
          }
        >
          <b>Roadmaps</b>
        </AccordionSummary>
        <AccordionDetails>
          <ul>
            {applicableIndustries.length > 0 ? (
              applicableIndustries.map((industry) => {
                return (
                  <li key={industry.id}>
                    <a
                      href={`/mgmt/cms#/collections/roadmaps/entries/${industry.id}`}
                      target="_top"
                    >
                      {industry.name}
                    </a>
                  </li>
                );
              })
            ) : (
              <li>This task is not used in any industry roadmaps.</li>
            )}
          </ul>
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      {industryRoadmaps()}
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        {task?.licenseName && (
          <div>
            <div>This file is mapped to the following license:</div>
            <div className="margin-bottom-10 text-bold">{task?.licenseName}</div>
          </div>
        )}

        <TaskPageSwitchComponent
          task={task}
          business={fakeBusinessWithMunicipality}
          displayContent={displayContent}
          roadmap={roadmap}
          CMS_ONLY_disable_default_functionality
        />
      </div>
    </>
  );
};

export default TaskPreview;
