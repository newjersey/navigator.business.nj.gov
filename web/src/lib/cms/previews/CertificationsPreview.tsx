import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Certification } from "@/lib/types/types";
import { CertificationElement } from "@/pages/certification/[certificationUrlSlug]";
import { ReactElement } from "react";

const CertificationsPreview = (props: PreviewProps): ReactElement<any> => {
  const ref = usePreviewRef(props);
  const certification = usePageData<Certification>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="h3-styling margin-top-5">----------Card in For You Section (My Account)----------</div>
      <OpportunityCard key={certification.id} opportunity={certification} urlPath="certification" />
      <div className="h3-styling margin-top-5">
        ----------Certification Details Page (My Account)----------
      </div>
      <CertificationElement certification={certification} />
    </div>
  );
};

export default CertificationsPreview;
