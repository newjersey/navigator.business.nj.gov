import { DbaAvailable } from "@/components/tasks/search-business-name/DbaAvailable";
import { DbaUnavailable } from "@/components/tasks/search-business-name/DbaUnavailable";
import { NexusAvailable } from "@/components/tasks/search-business-name/NexusAvailable";
import { NexusSearchBusinessNameTask } from "@/components/tasks/search-business-name/NexusSearchBusinessNameTask";
import { NexusUnavailable } from "@/components/tasks/search-business-name/NexusUnavailable";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateTask } from "@/test/factories";

const NexusNameSearchPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <NexusSearchBusinessNameTask
          task={generateTask({
            name: "Name is controlled by Task Metadata",
            contentMd: "Body text is controlled by Task Metadata",
          })}
        />
        <NexusAvailable
          submittedName="some name"
          updateButtonClicked={false}
          updateNameOnProfile={() => {}}
        />
        <NexusUnavailable
          submittedName="some name"
          nameAvailability={{ status: "UNAVAILABLE", similarNames: [] }}
          resetSearch={() => {}}
        />
        <DbaAvailable submittedName="some name" updateButtonClicked={false} updateNameOnProfile={() => {}} />
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
