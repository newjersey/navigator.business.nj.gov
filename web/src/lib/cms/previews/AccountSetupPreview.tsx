import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import type { ReactElement } from "react";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import AccountSetupPage from "@/pages/account-setup";

const AccountSetupPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <AccountSetupPage />
      </div>
    </ConfigContext.Provider>
  );
};

export default AccountSetupPreview;
