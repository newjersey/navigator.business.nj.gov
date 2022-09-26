/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
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

const CannabisEligibilityModalPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig((prevConfig) => JSON.parse(JSON.stringify(merge(prevConfig, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <h2>Eligibility Modal</h2>
      <button className="margin-2" onClick={() => setModalOpen(true)}>
        Open Modal
      </button>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <ModalTwoButton
          isOpen={modalOpen}
          close={() => {
            setModalOpen(false);
          }}
          title={data.cannabisEligibilityModal.eligibleModalTitle}
          primaryButtonText={data.cannabisEligibilityModal.eligibleModalContinueButton}
          primaryButtonOnClick={() => {
            setModalOpen(false);
          }}
          secondaryButtonText={data.cannabisEligibilityModal.eligibleModalCancelButton}
        >
          <Content>{data.cannabisEligibilityModal.eligibleModalBody}</Content>
        </ModalTwoButton>
      </div>
    </ConfigContext.Provider>
  );
};

export default CannabisEligibilityModalPreview;
