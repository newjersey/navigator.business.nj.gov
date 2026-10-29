import type { ContextualInfo } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { ContextInfoElement } from "@/components/ContextInfoElement";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const ContextInfoPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const contextualInfo: ContextualInfo = { markdown: body ?? "", ...data };

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <ContextInfoElement
        header={contextualInfo.header ?? ""}
        markdown={contextualInfo.markdown}
        isVisible={true}
      />
    </div>
  );
};

export default ContextInfoPreview;
