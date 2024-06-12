import { AnytimeActionTile } from "@/components/dashboard/anytime-actions/AnytimeActionTile";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { AnytimeActionLink } from "@/lib/types/types";
import { ReactElement } from "react";

const AnytimeActionLinkPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionLink>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div className="margin-y-3">
        <AnytimeActionTile type="link" anytimeAction={anytimeAction} />
      </div>
    </div>
  );
};

export default AnytimeActionLinkPreview;
