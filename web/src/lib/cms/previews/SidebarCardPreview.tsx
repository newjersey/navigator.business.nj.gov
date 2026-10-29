import type { SidebarCardContent } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { SidebarCard } from "@/components/dashboard/SidebarCard";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const RoadmapSidebarCardPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const card = usePageData<SidebarCardContent>(props);

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <SidebarCard card={card} />
    </div>
  );
};

export default RoadmapSidebarCardPreview;
