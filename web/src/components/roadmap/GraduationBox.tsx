import { Button } from "@/components/njwds-extended/Button";
import { GraduationModal } from "@/components/roadmap/GraduationModal";
import { MediaQueries } from "@/lib/PageSizes";
import { LoadDisplayContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement, useState } from "react";

type Props = {
  displayContent: LoadDisplayContent;
};

export const GraduationBox = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const openModal = async (): Promise<void> => {
    analytics.event.roadmap_graduate_button.click.view_graduation_modal();
    setModalOpen(true);
  };

  const renderMobileContent = (
    <div className="flex flex-column flex-align-center">
      <img src={`/img/congratulations-green.svg`} className="minw-8" alt="" />
      <h3 className="margin-bottom-105 margin-top-3 text-center">
        {Config.roadmapDefaults.graduationHeader}
      </h3>
      <p className="text-base-dark margin-bottom-3 text-center">
        {Config.roadmapDefaults.graduationBodyText}
      </p>
    </div>
  );

  const renderContent = (
    <div className="flex flex-align-center">
      <img src={`/img/congratulations-green.svg`} className="minw-8 margin-right-3" alt="" />
      <div className="margin-right-3">
        <h3 className="margin-bottom-105">{Config.roadmapDefaults.graduationHeader}</h3>
        <p className="text-base-dark">{Config.roadmapDefaults.graduationBodyText}</p>
      </div>
    </div>
  );

  return (
    <>
      <GraduationModal
        displayContent={props.displayContent}
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        onSave={() => undefined}
      />
      <div
        className={`padding-3 bg-base-lightest radius-md ${
          isTabletAndUp
            ? "display-flex flex-row flex-align-center flex-justify"
            : "display-flex flex-column flex-align-center"
        }`}
      >
        {isTabletAndUp ? renderContent : renderMobileContent}
        <Button style="primary" onClick={openModal} noRightMargin widthAutoOnMobile>
          {Config.roadmapDefaults.graduationButtonText}
        </Button>
      </div>
    </>
  );
};
