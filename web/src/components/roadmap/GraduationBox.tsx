import { Button } from "@/components/njwds-extended/Button";
import { LoadDisplayContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useState } from "react";
import { OnboardingModal } from "../onboarding/OnboardingModal";

type Props = {
  displayContent: LoadDisplayContent;
};

export const GraduationBox = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const graduateToOwning = async (): Promise<void> => {
    analytics.event.roadmap_graduate_button.click.view_graduation_modal();
    setModalOpen(true);
  };

  return (
    <>
      <OnboardingModal
        displayContent={props.displayContent}
        open={modalOpen}
        handleClose={() => setModalOpen(false)}
        onSave={() => undefined}
      />
      <div className="padding-3 bg-base-lightest radius-md fdr fac">
        <div>
          <img
            src={`/img/congratulations-green.svg`}
            style={{ width: "60px", height: "60px" }}
            className="margin-right-3"
            alt=""
          />
        </div>
        <div>
          <h3>{Config.roadmapDefaults.graduationHeader}</h3>
          <p className="margin-bottom-1 text-base-dark">{Config.roadmapDefaults.graduationBodyText}</p>
        </div>
        <div className="mla">
          <Button style="primary" onClick={graduateToOwning}>
            {Config.roadmapDefaults.graduationButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
