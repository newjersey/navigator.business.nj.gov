import type { XrayRenewalCalendarEventType } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { Xray } from "@/components/xray/Xray";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const XrayRenewalCalendarEventPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const renewal = usePageData<XrayRenewalCalendarEventType>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <Xray renewal={renewal} CMS_ONLY_disable_overlay={true} />
    </div>
  );
};

export default XrayRenewalCalendarEventPreview;
