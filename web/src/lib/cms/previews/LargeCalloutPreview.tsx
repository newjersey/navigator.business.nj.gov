import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

const LargeCalloutPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <LargeCallout calloutType="informational" showHeader>
          Body Text
        </LargeCallout>
        <LargeCallout calloutType="conditional" showHeader>
          Body Text
        </LargeCallout>
        <LargeCallout calloutType="warning" showHeader>
          Body Text
        </LargeCallout>
        <LargeCallout
          calloutType="quickReference"
          showHeader
          amountIconText="Amount Icon"
          filingTypeIconText="Filing Type Icon"
          frequencyIconText="Frequency Icon"
          phoneIconText="Phone Icon"
          emailIconText="Email Icon"
        >
          Body Text
        </LargeCallout>
      </div>
    </ConfigContext.Provider>
  );
};

export default LargeCalloutPreview;
