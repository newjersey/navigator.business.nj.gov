import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Authorization } from "@/components/tasks/business-formation/dba/Authorization";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement, useState } from "react";

const NexusDbaFormationPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Authorization />

        <hr className="margin-y-4" />

        <div ref={ref} style={{ pointerEvents: "all" }}>
          <h2>CTA Modal</h2>
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
