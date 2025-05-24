import { Xray } from "@/components/xray/Xray";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { RenewalEventType } from "@/lib/types/types";
import { ReactElement } from "react";

const RenewalCalendarEventPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const renewal = usePageData<RenewalEventType>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Xray renewal={renewal} CMS_ONLY_disable_overlay={true} />
    </div>
  );
};

export default RenewalCalendarEventPreview;
