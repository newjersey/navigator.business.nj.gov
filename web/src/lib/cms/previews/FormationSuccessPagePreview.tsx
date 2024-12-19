import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import {
  generateBusiness,
  generateFormationData,
  generateGetFilingResponse,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const FormationSuccessPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const business = generateBusiness({
    formationData: generateFormationData({
      getFilingResponse: generateGetFilingResponse({}),
    }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40 }}>
        <FormationSuccessPage business={business} />
      </div>
    </ConfigContext.Provider>
  );
};

export default FormationSuccessPreview;
