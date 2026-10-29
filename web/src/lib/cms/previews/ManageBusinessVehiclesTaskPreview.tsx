import type { Task } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { ManageBusinessVehicleResults } from "@/components/tasks/manage-business-vehicles/ManageBusinessVehicleResults";
import { ManageBusinessVehicles } from "@/components/tasks/manage-business-vehicles/ManageBusinessVehicles";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const ManageBusinessVehiclesTaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const task = usePageData<Task>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="margin-bottom-5">
        H1 Header (Title) can be updated in manage-business-vehicles file that resides in task-all
      </div>
      <ManageBusinessVehicles task={task} CMS_ONLY_disable_error />
      <div className="margin-bottom-5">
        <ManageBusinessVehicleResults taskId={task.id} />
      </div>
      <ManageBusinessVehicleResults taskId={task.id} CMS_ONLY_radioSelection />
    </div>
  );
};

export default ManageBusinessVehiclesTaskPreview;
