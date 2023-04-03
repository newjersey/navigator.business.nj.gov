import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { Funding } from "@/lib/types/types";
import { FundingElement } from "@/pages/funding/[fundingUrlSlug]";
import { ReactElement } from "react";

const FundingsPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const funding = usePageData<Funding>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <FundingElement funding={funding} />
    </div>
  );
};

export default FundingsPreview;
