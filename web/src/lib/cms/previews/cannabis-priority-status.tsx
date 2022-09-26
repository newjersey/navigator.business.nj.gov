/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { CannabisPriorityStatusTask } from "@/components/tasks/cannabis/CannabisPriorityStatusTask";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import { templateEval } from "@/lib/utils/helpers";
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

const CannabisPriorityStatusPreview = (props: Props) => {
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

  const { tab } = getMetadataFromSlug(props.entry.toJS().slug);

  const priorityStatusTypes = {
    type1: data.cannabisPriorityStatus.minorityWomenOrVeteran,
    type2: data.cannabisPriorityStatus.impactZone,
    type3: data.cannabisPriorityStatus.socialEquity,
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <CannabisPriorityStatusTask
          task={generateTask({ name: "Name is controlled by Task Metadata" })}
          CMS_ONLY_tab={tab}
        />

        {tab === "1" && (
          <>
            <hr className="margin-y-4" />
            <h2>Priority Status Types</h2>

            <Alert variant="info">
              <Content>{templateEval(data.cannabisPriorityStatus.phrase1, priorityStatusTypes)}</Content>
            </Alert>

            <Alert variant="info">
              <Content>{templateEval(data.cannabisPriorityStatus.phrase2, priorityStatusTypes)}</Content>
            </Alert>

            <Alert variant="info">
              <Content>{templateEval(data.cannabisPriorityStatus.phrase3, priorityStatusTypes)}</Content>
            </Alert>
          </>
        )}
      </div>
    </ConfigContext.Provider>
  );
};

export default CannabisPriorityStatusPreview;
