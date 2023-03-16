import { DbaAvailable } from "@/components/tasks/business-formation/name/DbaAvailable";
import { DbaUnavailable } from "@/components/tasks/business-formation/name/DbaUnavailable";
import { NexusAvailable } from "@/components/tasks/business-formation/name/NexusAvailable";
import { NexusSearchBusinessNameStep } from "@/components/tasks/business-formation/name/NexusSearchBusinessNameStep";
import { NexusUnavailable } from "@/components/tasks/business-formation/name/NexusUnavailable";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const NexusNameSearchPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <NexusSearchBusinessNameStep />
        <NexusAvailable submittedName="some name" updateButtonClicked={false} />
        <NexusUnavailable
          submittedName="some name"
          nameAvailability={{ status: "UNAVAILABLE", similarNames: [] }}
          resetSearch={() => {}}
        />
        <DbaAvailable submittedName="some name" updateButtonClicked={false} />
        <DbaUnavailable
          submittedName="some name"
          nameAvailability={{ status: "UNAVAILABLE", similarNames: ["name 1", "name 2"] }}
          resetSearch={() => {}}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default NexusNameSearchPreview;
