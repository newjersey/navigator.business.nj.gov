import { QuickActionTaskTile } from "@/components/dashboard/QuickActionTaskTile";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { QuickActionTask } from "@/lib/types/types";
import { QuickActionElement } from "@/pages/actions/[quickActionTaskUrlSlug]";
import { ReactElement } from "react";

const QuickActionTaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const quickAction = usePageData<QuickActionTask>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="margin-y-10">
        <QuickActionTaskTile quickAction={quickAction} />
      </div>
      <QuickActionElement quickActionTask={quickAction} />
    </div>
  );
};

export default QuickActionTaskPreview;
