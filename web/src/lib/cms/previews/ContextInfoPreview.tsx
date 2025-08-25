import { ContextInfoElement } from "@/components/ContextInfoElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ContextualInfo } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

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
