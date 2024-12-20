import { FormationInterimSuccessPage } from "@/components/tasks/business-formation/FormationInterimSuccessPage";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement } from "react";

const FormationInterimSuccessPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40 }}>
        <div className="flex flex-column min-height-38rem">
          <FormationInterimSuccessPage taskUrlSlug="" setStepIndex={(): void => {}} />
        </div>
      </div>
    </ConfigContext.Provider>
  );
};

export default FormationInterimSuccessPreview;
