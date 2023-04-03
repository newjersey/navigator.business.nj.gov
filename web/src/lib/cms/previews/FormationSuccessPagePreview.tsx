import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateFormationData, generateGetFilingResponse, generateUserData } from "@/test/factories";
import { ReactElement } from "react";

const FormationSuccessPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const userData = generateUserData({
    formationData: generateFormationData({
      getFilingResponse: generateGetFilingResponse({}),
    }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40 }}>
        <FormationSuccessPage userData={userData} />
      </div>
    </ConfigContext.Provider>
  );
};

export default FormationSuccessPreview;
