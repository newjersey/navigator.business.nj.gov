import { AnytimeActionElement } from "@/components/dashboard/anytime-actions/AnytimeActionPage";
import { AnytimeActionTile } from "@/components/dashboard/anytime-actions/AnytimeActionTile";
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
      <div className="margin-y-10">
        <AnytimeActionTile type="license" anytimeAction={anytimeAction} />
      </div>
      <AnytimeActionElement anytimeAction={anytimeAction} />
    </div>
  );
};

export default AnytimeActionLicenseReinstatementPreview;
