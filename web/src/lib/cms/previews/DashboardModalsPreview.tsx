import { CongratulatoryModal } from "@/components/CongratulatoryModal";
import { SectorModal } from "@/components/dashboard/SectorModal";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { useState } from "react";

const DashboardModalsPreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [sectorModalOpen, setSectorModalOpen] = useState(false);
  const [congratsModalOpen, setCongratsModalOpen] = useState(false);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <button
        className="margin-2"
        onClick={() => {
          return setCongratsModalOpen(true);
        }}
      >
        Open Congratulatory Modal
      </button>

      <button
        className="margin-2"
        onClick={() => {
          return setSectorModalOpen(true);
        }}
      >
        Open Sector Modal
      </button>

      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <CongratulatoryModal
          nextSectionType="START"
          open={congratsModalOpen}
          handleClose={() => {
            return setCongratsModalOpen(false);
          }}
        />

        <SectorModal
          open={sectorModalOpen}
          onContinue={() => {}}
          handleClose={() => {
            return setSectorModalOpen(false);
          }}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default DashboardModalsPreview;
