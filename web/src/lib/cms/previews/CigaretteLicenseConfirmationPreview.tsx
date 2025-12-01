import { ConfirmationPage } from "@/components/tasks/cigarette-license/Confirmation";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import {
  generateBusiness,
  generateCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const CigaretteLicenseConfirmationPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const business = generateBusiness({
    cigaretteLicenseData: generateCigaretteLicenseData({
      paymentInfo: {
        orderId: 12345,
        orderTimestamp: new Date().toString(),
      },
    }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40 }}>
        <ConfirmationPage business={business} />
      </div>
    </ConfigContext.Provider>
  );
};

export default CigaretteLicenseConfirmationPreview;
