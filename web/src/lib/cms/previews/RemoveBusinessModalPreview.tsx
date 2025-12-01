import { RemoveBusinessModal } from "@/components/dashboard/RemoveBusinessModal";
import { RemoveBusinessContext } from "@/contexts/removeBusinessContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement, useState } from "react";
import { generateBusiness } from "@businessnjgovnavigator/shared/test";

const RemoveBusinessModalPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [showRemoveBusinessModal, setShowRemoveBusinessModal] = useState<boolean>(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <RemoveBusinessContext.Provider
        value={{
          showRemoveBusinessModal: showRemoveBusinessModal,
          setShowRemoveBusinessModal: () => {
            setShowRemoveBusinessModal(false);
          },
        }}
      >
        <button onClick={() => setShowRemoveBusinessModal(true)}>toggle modal</button>
        <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
          <RemoveBusinessModal CMS_ONLY_fakeBusiness={generateBusiness({})} />
        </div>
      </RemoveBusinessContext.Provider>
    </ConfigContext.Provider>
  );
};

export default RemoveBusinessModalPreview;
