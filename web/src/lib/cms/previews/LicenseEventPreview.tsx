import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { LicenseEvent } from "@/lib/types/types";
import { LicenseElement } from "@/pages/licenses/[licenseUrlSlug]";
import { ReactElement } from "react";

const LicenseEventPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const license = usePageData<LicenseEvent>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <LicenseElement
        licenseName="IndustryName"
        license={license}
        licenseEventType={license.previewType ?? "expiration"}
        dueDate={license.previewType === "renewal" ? "2024-02-01" : "2024-01-01"}
        preview
      />
    </div>
  );
};

export default LicenseEventPreview;
