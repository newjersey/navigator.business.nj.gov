import { LoginEmailCheck } from "@/components/LoginEmailCheck";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

const LoginEmailCheckPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const { config, setConfig } = usePreviewConfig(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <LoginEmailCheck />
      </div>
    </ConfigContext.Provider>
  );
};

export default LoginEmailCheckPreview;
