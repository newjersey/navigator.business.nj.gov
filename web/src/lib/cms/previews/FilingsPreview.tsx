import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { FilingElement } from "@/pages/filings/[filingUrlSlug]";
import { Filing } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

const FilingsPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const filing = usePageData<Filing>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <FilingElement filing={filing} dueDate={"2024-01-01"} preview />
    </div>
  );
};

export default FilingsPreview;
