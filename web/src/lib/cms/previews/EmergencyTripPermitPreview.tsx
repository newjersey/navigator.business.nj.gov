import { EmergencyTripPermit } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermit";
import {
  DataFormErrorMapContext,
  createDataFormErrorMap,
} from "@/contexts/dataFormErrorMapContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

const EmergencyTripPermitPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const { config, setConfig } = usePreviewConfig(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <DataFormErrorMapContext.Provider
        value={{
          fieldStates: createDataFormErrorMap(),
          runValidations: false,
          reducer: () => {},
        }}
      >
        <div className="cms" ref={ref} style={{ margin: 40 }}>
          <EmergencyTripPermit />
        </div>
      </DataFormErrorMapContext.Provider>
    </ConfigContext.Provider>
  );
};

export default EmergencyTripPermitPreview;
