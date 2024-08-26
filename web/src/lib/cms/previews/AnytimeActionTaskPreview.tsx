import { AnytimeActionSwitchComponent } from "@/components/tasks/anytime-action/AnytimeActionSwitchComponent";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { AnytimeActionTask } from "@/lib/types/types";
import { ReactElement } from "react";

const AnytimeActionTaskPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const anytimeAction = usePageData<AnytimeActionTask>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <AnytimeActionSwitchComponent anytimeActionTask={anytimeAction} />
    </div>
  );
};

export default AnytimeActionTaskPreview;
