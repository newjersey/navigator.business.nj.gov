import { DeferredLocationQuestion } from "@/components/DeferredLocationQuestion";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import {
  generateBusiness,
  generateMunicipality,
  generateProfileData,
} from "@businessnjgovnavigator/shared";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

const DeferredLocationPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <DeferredLocationQuestion innerContent="" />
        <DeferredLocationQuestion
          innerContent=""
          CMS_ONLY_showSuccessBanner={true}
          CMS_ONLY_fakeBusiness={generateBusiness({
            profileData: generateProfileData({
              municipality: generateMunicipality({ displayName: "Newark" }),
            }),
          })}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default DeferredLocationPreview;
