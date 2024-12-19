import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { SectorModal } from "@/components/dashboard/SectorModal";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ReactElement, useState } from "react";

const DashboardModalsPreview = (props: PreviewProps): ReactElement<any> => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [congratsModalOpen, setCongratsModalOpen] = useState(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <button className="margin-2" onClick={(): void => setCongratsModalOpen(true)}>
        Open Congratulatory Modal
      </button>

      <button className="margin-2" onClick={(): void => setSectorModalOpen(true)}>
        Open Sector Modal
      </button>

      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <CongratulatoryModal
          nextSectionType="START"
          open={congratsModalOpen}
          handleClose={(): void => setCongratsModalOpen(false)}
        />

        <SectorModal
          open={sectorModalOpen}
          onContinue={(): void => {}}
          handleClose={(): void => setSectorModalOpen(false)}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardModalsPreview;
