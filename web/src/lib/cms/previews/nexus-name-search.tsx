/* eslint-disable @typescript-eslint/no-explicit-any */
import { DbaAvailable } from "@/components/tasks/search-business-name/DbaAvailable";
import { DbaUnavailable } from "@/components/tasks/search-business-name/DbaUnavailable";
import { NexusAvailable } from "@/components/tasks/search-business-name/NexusAvailable";
import { NexusSearchBusinessNameTask } from "@/components/tasks/search-business-name/NexusSearchBusinessNameTask";
import { NexusUnavailable } from "@/components/tasks/search-business-name/NexusUnavailable";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { generateTask } from "@/test/factories";
import { merge } from "lodash";
import { useEffect, useRef, useState } from "react";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  fieldsMetaData: any;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const NexusNameSearchPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig(JSON.parse(JSON.stringify(merge(config, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

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
