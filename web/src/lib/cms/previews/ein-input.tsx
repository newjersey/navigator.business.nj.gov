/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { EinDisplay } from "@/components/tasks/EinDisplay";
import { EinInput } from "@/components/tasks/EinInput";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
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

const EinInputPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  const task = generateTask({
    name: "Name is controlled by Task Metadata",
    contentMd: "Body content is controlled by Task Metadata",
  });

  useEffect(() => {
    setConfig((prevConfig) => JSON.parse(JSON.stringify(merge(prevConfig, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Content>{data.ein.descriptionText}</Content>
        <EinInput task={task} isAuthenticated={IsAuthenticated.TRUE} onSave={() => {}} />

        <hr className="margin-y-6" />

        <Content>{data.ein.descriptionText}</Content>
        <EinDisplay onEdit={() => {}} onRemove={() => {}} employerId="123456789" />
      </div>
    </ConfigContext.Provider>
  );
};

export default EinInputPreview;
