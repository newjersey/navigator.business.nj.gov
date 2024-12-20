import { TaskPageSwitchComponent } from "@/components/TaskPageSwitchComponent";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { createEmptyTaskDisplayContent, TaskWithLicenseTaskId } from "@/lib/types/types";
import { generateRoadmap } from "@/test/factories";
import {
  generateBusiness,
  generateMunicipality,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const TaskPreview = (props: PreviewProps): ReactElement<any> => {
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

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div>
        <div>This file is mapped to the following license (not enabled if blank):</div>
        <div className="margin-bottom-10 text-bold">{task?.licenseName}</div>
      </div>

      <TaskPageSwitchComponent
        task={task}
        business={fakeBusinessWithMunicipality}
        displayContent={displayContent}
        roadmap={roadmap}
        CMS_ONLY_disable_overlay
      />
    </div>
  );
};

export default TaskPreview;
