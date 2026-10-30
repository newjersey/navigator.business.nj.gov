import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { type ReactElement, useState } from "react";
import { FormationDateDeletionModal } from "@/components/FormationDateDeletionModal";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";

const FormationDateDeletionModalPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <button type="button" onClick={() => setModalOpen(true)}>
        toggle modal
      </button>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <FormationDateDeletionModal
          isOpen={modalOpen}
          handleCancel={() => setModalOpen(false)}
          handleDelete={() => setModalOpen(false)}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default FormationDateDeletionModalPreview;
