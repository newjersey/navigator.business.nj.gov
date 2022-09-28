/* eslint-disable @typescript-eslint/no-explicit-any */
import { FormationSuccessPage } from "@/components/tasks/business-formation/success/FormationSuccessPage";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { generateFormationData, generateGetFilingResponse, generateUserData } from "@/test/factories";
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

const FormationSuccessPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig((prevConfig) => JSON.parse(JSON.stringify(merge(prevConfig, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

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
