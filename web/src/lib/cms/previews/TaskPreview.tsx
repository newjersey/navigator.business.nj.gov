import { TaskElement } from "@/components/TaskElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Task } from "@/lib/types/types";
import {
  generateBusiness,
  generateMunicipality,
  generateProfileData
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const TaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const task = usePageData<Task>(props);

  const fakeBusinessWithMunicipality = generateBusiness({
    profileData: generateProfileData({
      municipality: generateMunicipality({})
    })
  });

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <TaskElement task={task} CMS_ONLY_fakeBusiness={fakeBusinessWithMunicipality} />
    </div>
  );
};

export default TaskPreview;
