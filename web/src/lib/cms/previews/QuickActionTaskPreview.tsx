import { QuickActionElement } from "@/components/dashboard/quick-actions/QuickActionPage";
import { QuickActionTile } from "@/components/dashboard/quick-actions/QuickActionTile";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { QuickActionTask } from "@/lib/types/types";
import { ReactElement } from "react";

const QuickActionTaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const quickAction = usePageData<QuickActionTask>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="margin-y-10">
        <QuickActionTile type="task" quickAction={quickAction} />
      </div>
      <QuickActionElement quickAction={quickAction} />
    </div>
  );
};

export default QuickActionTaskPreview;
