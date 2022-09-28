import { FormationInterimSuccessPage } from "@/components/tasks/business-formation/FormationInterimSuccessPage";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const FormationInterimSuccessPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40 }}>
        <div className="flex flex-column minh-38">
          <FormationInterimSuccessPage taskUrlSlug="" setStepIndex={() => {}} />
        </div>
      </div>
    </ConfigContext.Provider>
  );
};

export default FormationInterimSuccessPreview;
