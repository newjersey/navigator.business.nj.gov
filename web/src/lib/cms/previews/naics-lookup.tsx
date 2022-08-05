/* eslint-disable @typescript-eslint/no-explicit-any */
import { NaicsCodeDisplay } from "@/components/tasks/NaicsCodeDisplay";
import { NaicsCodeInput } from "@/components/tasks/NaicsCodeInput";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
import merge from "lodash-es/merge";
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

const NaicsLookupPreview = (props: Props) => {
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

  const userData = generateUserData({
    profileData: generateProfileData({
      naicsCode: "",
      industryId: "cannabis",
    }),
  });

  useEffect(() => {
    setConfig(JSON.parse(JSON.stringify(merge(config, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <NaicsCodeInput
          onSave={() => {}}
          task={task}
          isAuthenticated={IsAuthenticated.TRUE}
          CMS_ONLY_fakeUserData={userData}
          CMS_ONLY_displayInput={true}
        />

        <hr className="margin-y-6" />

        <NaicsCodeDisplay onEdit={() => {}} code={"441221"} />
      </div>
    </ConfigContext.Provider>
  );
};

export default NaicsLookupPreview;
