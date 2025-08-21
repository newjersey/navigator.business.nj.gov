import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import NJEDAFundingsOnboardingPaage from "@/pages/njeda";
import { generateFunding } from "@/test/factories";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement, useState } from "react";

const NjedaPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const fundings = [generateFunding({}), generateFunding({})];

  const [modalOpen, setModalOpen] = useState(0);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <button onClick={() => setModalOpen((prev) => prev + 1)}>toggle modal</button>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <NJEDAFundingsOnboardingPaage
          fundings={fundings}
          noAuth={true}
          CMS_PREVIEW_ONLY_OPEN_MODAL={modalOpen}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default NjedaPreview;
