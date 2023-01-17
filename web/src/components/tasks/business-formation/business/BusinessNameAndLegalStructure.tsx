import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { scrollToTop } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { PublicFilingLegalType } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext, useState } from "react";

interface Props {
  isReviewStep?: boolean;
}

export const BusinessNameAndLegalStructure = ({ isReviewStep = false }: Props): ReactElement => {
  const [legalStructureWarningIsOpen, setLegalStructureWarningIsOpen] = useState<boolean>(false);
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const router = useRouter();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const editLegalStructure = () => {
    analytics.event.business_formation_legal_structure_modal.submit.go_to_profile_screen();
    router.push("/profile?path=businessFormation");
  };

  const showLegalStructureModal = () => {
    analytics.event.business_formation_legal_structure_edit.click.show_legal_structure_modal();
    setLegalStructureWarningIsOpen(true);
  };

  const legalStructureName = () =>
    `${
      userData?.profileData.businessPersona == "FOREIGN"
        ? `${Config.businessFormationDefaults.foreignLegalPrefaceText} `
        : ""
    }${
      (
        {
          "limited-liability-company": Config.businessFormationDefaults.llcText,
          "limited-liability-partnership": Config.businessFormationDefaults.llpText,
          "limited-partnership": Config.businessFormationDefaults.lpText,
          "c-corporation": Config.businessFormationDefaults.cCorpText,
          "s-corporation": Config.businessFormationDefaults.sCorpText,
        } as Record<PublicFilingLegalType, string>
      )[userData?.profileData.legalStructureId as PublicFilingLegalType]
    }`;

  if (!userData) {
    return <></>;
  }

  return (
    <>
      <div className="flex space-between margin-bottom-2 flex-align-center">
        <div className="maxw-mobile-lg ">
          <h2 className="h3-styling">
            {Config.businessFormationDefaults.businessNameAndLegalStructureHeader}
          </h2>
        </div>
        <div className="margin-left-2">
          {isReviewStep && (
            <Button
              style="tertiary"
              onClick={() => {
                analytics.event.business_formation_business_name_edit.click.go_to_name_search_step();
                setStepIndex(LookupStepIndexByName("Business"));
                scrollToTop();
              }}
              underline
              dataTestid="edit-business-name-step"
            >
              {Config.businessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
      </div>

      <div
        className={`min-height-575rem bg-base-lightest margin-bottom-1 ${
          isTabletAndUp ? "display-flex" : "display-block flex-row"
        }`}
      >
        <div className="padding-205 flex-half">
          <Content>{Config.businessFormationDefaults.reviewStepBusinessNameLabel}</Content>
          <span className="text-accent-cool-darker">
            {state.formationFormData.businessName || Config.businessFormationDefaults.notSetBusinessNameText}{" "}
            {""}
          </span>
          {!isReviewStep && (
            <Button
              style="tertiary"
              widthAutoOnMobile
              onClick={() => {
                setStepIndex(LookupStepIndexByName("Name"));
              }}
              underline
              dataTestid="edit-business-name"
            >
              {Config.businessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
        <div
          className="padding-bottom-205 padding-x-205 tablet:padding-205 flex-half"
          data-testid="legal-structure"
        >
          <Content>{Config.businessFormationDefaults.reviewStepLegalStructureLabel}</Content>
          <span>{legalStructureName()}</span>
          <span> </span>
          {!isReviewStep && (
            <Button
              style="tertiary"
              widthAutoOnMobile
              onClick={showLegalStructureModal}
              underline
              dataTestid="edit-legal-structure"
            >
              {Config.businessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
      </div>
      <ModalTwoButton
        isOpen={legalStructureWarningIsOpen}
        close={() => {
          return setLegalStructureWarningIsOpen(false);
        }}
        title={Config.businessFormationDefaults.legalStructureWarningModalHeader}
        primaryButtonText={Config.businessFormationDefaults.legalStructureWarningModalContinueButtonText}
        primaryButtonOnClick={editLegalStructure}
        secondaryButtonText={Config.businessFormationDefaults.legalStructureWarningModalCancelButtonText}
      >
        <Content>{Config.businessFormationDefaults.legalStructureWarningModalBody}</Content>
      </ModalTwoButton>
    </>
  );
};
