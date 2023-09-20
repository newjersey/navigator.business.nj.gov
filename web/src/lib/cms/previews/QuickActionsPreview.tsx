import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { QuickAction } from "@/lib/types/types";
import { QuickActionElement } from "@/pages/actions/[quickActionUrlSlug]";
import { ReactElement } from "react";

const QuickActionsPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const quickAction = usePageData<QuickAction>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <QuickActionElement quickAction={quickAction} />
    </div>
  );
};

export default QuickActionsPreview;
