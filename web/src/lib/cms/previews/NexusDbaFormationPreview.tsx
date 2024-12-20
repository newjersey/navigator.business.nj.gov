import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Heading } from "@/components/njwds-extended/Heading";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement, useState } from "react";

const NexusDbaFormationPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <div ref={ref} style={{ pointerEvents: "all" }}>
          <Heading level={2}>CTA Modal</Heading>
          <button onClick={(): void => setModalOpen(true)}>Open CTA Modal</button>
        </div>

        <ModalTwoButton
          isOpen={modalOpen}
          close={(): void => setModalOpen(false)}
          title={config.DbaFormationTask.dbaCtaModalHeader}
          primaryButtonText={config.DbaFormationTask.dbaCtaModalContinueButtonText}
          primaryButtonOnClick={(): void => setModalOpen(false)}
          secondaryButtonText={config.DbaFormationTask.dbaCtaModalCancelButtonText}
        >
          <Content>{config.DbaFormationTask.dbaCtaModalBody}</Content>
        </ModalTwoButton>
      </div>
    </ConfigContext.Provider>
  );
};

export default NexusDbaFormationPreview;
