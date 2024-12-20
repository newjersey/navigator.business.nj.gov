import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import PageNotFound from "@/pages/404";
import { ReactElement } from "react";

const PageNotFoundPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <PageNotFound />
      </div>
    </ConfigContext.Provider>
  );
};

export default PageNotFoundPreview;
