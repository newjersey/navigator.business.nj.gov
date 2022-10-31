import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { useState } from "react";

const CannabisEligibilityModalPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <h2>Eligibility Modal</h2>
      <button
        className="margin-2"
        onClick={() => {
          return setModalOpen(true);
        }}
      >
        Open Modal
      </button>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <ModalTwoButton
          isOpen={modalOpen}
          close={() => {
            setModalOpen(false);
          }}
          title={config.cannabisEligibilityModal.eligibleModalTitle}
          primaryButtonText={config.cannabisEligibilityModal.eligibleModalContinueButton}
          primaryButtonOnClick={() => {
            setModalOpen(false);
          }}
          secondaryButtonText={config.cannabisEligibilityModal.eligibleModalCancelButton}
        >
          <Content>{config.cannabisEligibilityModal.eligibleModalBody}</Content>
        </ModalTwoButton>
      </div>
    </ConfigContext.Provider>
  );
};

export default CannabisEligibilityModalPreview;
