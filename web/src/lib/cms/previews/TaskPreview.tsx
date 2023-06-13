import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Task } from "@/lib/types/types";
import { TaskElement } from "@/pages/tasks/[taskUrlSlug]";
import { ReactElement } from "react";

const TaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const task = usePageData<Task>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <TaskElement task={task} overrides={{ skipDeferredLocationQuestion: true }} />
    </div>
  );
};

export default TaskPreview;
