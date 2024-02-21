import { QuickActionTile } from "@/components/dashboard/QuickActionTile";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { QuickActionLicenseReinstatement } from "@/lib/types/types";
import { QuickActionElement } from "@/pages/actions/[quickActionTaskUrlSlug]";
import { ReactElement } from "react";

const QuickActionLicenseReinstatementPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const quickAction = usePageData<QuickActionLicenseReinstatement>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="margin-y-10">
        <QuickActionTile type="license" quickAction={quickAction} />
      </div>
      <QuickActionElement quickActionTask={quickAction} />
    </div>
  );
};

export default QuickActionLicenseReinstatementPreview;
