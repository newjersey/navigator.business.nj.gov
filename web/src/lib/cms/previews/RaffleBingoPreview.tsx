import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { RaffleBingoSwitchComponent } from "@/lib/cms/previews/RaffleBingoSwitchComponent";
import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

const RaffleBingoPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const task = usePageData<Task>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <RaffleBingoSwitchComponent task={task} />
    </div>
  );
};

export default RaffleBingoPreview;
