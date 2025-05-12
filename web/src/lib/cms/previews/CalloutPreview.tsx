import { Callout } from "@/components/njwds-extended/callout/Callout";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const CalloutPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Callout calloutType="informational" showIcon="true" showHeader>
          Body Text
        </Callout>
        <Callout calloutType="conditional" showIcon="true" showHeader>
          Body Text
        </Callout>
        <Callout calloutType="warning" showIcon="true" showHeader>
          Body Text
        </Callout>
        <Callout
          calloutType="quickReference"
          showIcon="true"
          showHeader
          amountIconText="Amount Icon"
          filingTypeIconText="Filing Type Icon"
          frequencyIconText="Frequency Icon"
          phoneIconText="Phone Icon"
          emailIconText="Email Icon"
        >
          Body Text
        </Callout>
      </div>
    </ConfigContext.Provider>
  );
};

export default CalloutPreview;
