import { Content } from "@/components/Content";
import { AnytimeActionElement } from "@/components/dashboard/anytime-actions/AnytimeActionPage";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";
import { ReactElement } from "react";

const AnytimeActionLicenseReinstatementPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionLicenseReinstatement>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div>This file is mapped to the following license (not enabled if blank):</div>
      <div className="margin-top-5">
        <div>Above License Status Copy - Include Any Horizontal Lines</div>
        <Content>{anytimeAction.aboveLicenseStatusContent}</Content>
      </div>
      <div className="margin-top-10 text-bold">{anytimeAction.licenseName}</div>
      <AnytimeActionElement anytimeAction={anytimeAction} />
    </div>
  );
};

export default AnytimeActionLicenseReinstatementPreview;
