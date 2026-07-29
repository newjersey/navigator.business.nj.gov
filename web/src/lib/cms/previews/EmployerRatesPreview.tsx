import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";
import { EmployerRates } from "@/components/employer-rates/EmployerRates";

const EmployerRatesPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <DataFormErrorMapContext.Provider value={formContextState}>
        <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
          <EmployerRates CMS_ONLY_enable_preview />
        </div>
      </DataFormErrorMapContext.Provider>
    </ConfigContext.Provider>
  );
};

export default EmployerRatesPreview;
