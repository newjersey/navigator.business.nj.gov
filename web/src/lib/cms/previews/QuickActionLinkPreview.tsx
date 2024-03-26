import { QuickActionTile } from "@/components/dashboard/quick-actions/QuickActionTile";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { QuickActionLink } from "@/lib/types/types";
import { ReactElement } from "react";

const QuickActionLinkPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const quickAction = usePageData<QuickActionLink>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="margin-y-3">
        <QuickActionTile type="link" quickAction={quickAction} />
      </div>
    </div>
  );
};

export default QuickActionLinkPreview;
