import { Callout } from "@/components/Callout";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const CalloutPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Callout calloutType="informational" showIcon="true">
          Body Text
        </Callout>
        <Callout calloutType="conditional" showIcon="true">
          Body Text
        </Callout>
        <Callout calloutType="warning" showIcon="true">
          Body Text
        </Callout>
        <Callout calloutType="note" showIcon="true">
          Body Text
        </Callout>
      </div>
    </ConfigContext.Provider>
  );
};

export default CalloutPreview;
