import { DeferredLocationQuestion } from "@/components/DeferredLocationQuestion";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateProfileData, generateUserData } from "@/test/factories";
import { generateMunicipality } from "@businessnjgovnavigator/shared";

const DeferredLocationPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <DeferredLocationQuestion innerContent="" />
        <DeferredLocationQuestion
          innerContent=""
          CMS_ONLY_showSuccessBanner={true}
          CMS_ONLY_fakeUserData={generateUserData({
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
