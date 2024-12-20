import { OpportunityCard } from "@/components/dashboard/OpportunityCard";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Funding } from "@/lib/types/types";
import { FundingElement } from "@/pages/funding/[fundingUrlSlug]";
import { ReactElement } from "react";

const FundingsPreview = (props: PreviewProps): ReactElement<any> => {
  const ref = usePreviewRef(props);
  const funding = usePageData<Funding>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="h3-styling margin-top-5">----------Card in For You Section (My Account)----------</div>
      <OpportunityCard key={funding.id} opportunity={funding} urlPath="funding" />
      <div className="h3-styling margin-top-5">----------Funding Details Page (My Account)----------</div>
      <FundingElement funding={funding} />
    </div>
  );
};

export default FundingsPreview;
