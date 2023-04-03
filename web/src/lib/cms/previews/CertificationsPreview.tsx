import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Certification } from "@/lib/types/types";
import { CertificationElement } from "@/pages/certification/[certificationUrlSlug]";
import { ReactElement } from "react";

const CertificationsPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const certification = usePageData<Certification>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <CertificationElement certification={certification} />
    </div>
  );
};

export default CertificationsPreview;
