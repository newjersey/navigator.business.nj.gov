/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { NexusFormationTask } from "@/components/tasks/NexusFormationTask";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
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

const NexusDbaFormationPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [config, setConfig] = useState<ConfigType>(getMergedConfig());
  const [modalOpen, setModalOpen] = useState(false);

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig((prevConfig) => JSON.parse(JSON.stringify(merge(prevConfig, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

  const noNameSearchUserData = generateUserData({
    profileData: generateProfileData({
      businessName: "",
      nexusDbaName: undefined,
    }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <NexusFormationTask
          task={generateTask({ name: "Name is controlled by Task Metadata" })}
          CMS_ONLY_fakeUserData={noNameSearchUserData}
        />

        <hr className="margin-y-4" />

        <div ref={ref} style={{ pointerEvents: "all" }}>
          <h2>CTA Modal</h2>
          <button onClick={() => setModalOpen(true)}>Open CTA Modal</button>
        </div>

        <ModalTwoButton
          isOpen={modalOpen}
          close={() => setModalOpen(false)}
          title={data.nexusFormationTask.dbaCtaModalHeader}
          primaryButtonText={data.nexusFormationTask.dbaCtaModalContinueButtonText}
          primaryButtonOnClick={() => setModalOpen(false)}
          secondaryButtonText={data.nexusFormationTask.dbaCtaModalCancelButtonText}
        >
          <Content>{data.nexusFormationTask.dbaCtaModalBody}</Content>
        </ModalTwoButton>
      </div>
    </ConfigContext.Provider>
  );
};

export default NexusDbaFormationPreview;
