import { RaffleBingoPaginator } from "@/components/tasks/RaffleBingoPaginator";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Task } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { ReactElement } from "react";

const RaffleBingoPreview = (props: PreviewProps): ReactElement<any> => {
  const ref = usePreviewRef(props);
  const task = usePageData<Task>(props);

  const raffleBingoSwitch = rswitch(task.filename, {
    "raffle-license-step-1": <RaffleBingoPaginator task={task} CMS_ONLY_stepIndex={0} />,
    "raffle-license-step-2": <RaffleBingoPaginator task={task} CMS_ONLY_stepIndex={1} />,
    default: <RaffleBingoPaginator task={task} />,
  });

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      {raffleBingoSwitch}
    </div>
  );
};

export default RaffleBingoPreview;
