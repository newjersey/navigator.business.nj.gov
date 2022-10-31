import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { NexusFormationTask } from "@/components/tasks/NexusFormationTask";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { generateProfileData, generateTask, generateUserData } from "@/test/factories";
import { useState } from "react";

const NexusDbaFormationPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

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
          <button
            onClick={() => {
              return setModalOpen(true);
            }}
          >
            Open CTA Modal
          </button>
        </div>

        <ModalTwoButton
          isOpen={modalOpen}
          close={() => {
            return setModalOpen(false);
          }}
          title={config.nexusFormationTask.dbaCtaModalHeader}
          primaryButtonText={config.nexusFormationTask.dbaCtaModalContinueButtonText}
          primaryButtonOnClick={() => {
            return setModalOpen(false);
          }}
          secondaryButtonText={config.nexusFormationTask.dbaCtaModalCancelButtonText}
        >
          <Content>{config.nexusFormationTask.dbaCtaModalBody}</Content>
        </ModalTwoButton>
      </div>
    </ConfigContext.Provider>
  );
};

export default NexusDbaFormationPreview;
