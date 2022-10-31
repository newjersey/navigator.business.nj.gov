import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationLegalType, LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useContext, useState } from "react";

interface Props {
  isReviewStep?: boolean;
}

export const BusinessNameAndLegalStructure = ({ isReviewStep = false }: Props): ReactElement => {
  const [legalStructureWarningIsOpen, setLegalStructureWarningIsOpen] = useState<boolean>(false);
  const { setStepIndex } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const router = useRouter();

  const editLegalStructure = () => {
    analytics.event.business_formation_legal_structure_modal.submit.go_to_profile_screen();
    router.push("/profile?path=businessFormation");
  };

  const showLegalStructureModal = () => {
    analytics.event.business_formation_legal_structure_edit.click.show_legal_structure_modal();
    setLegalStructureWarningIsOpen(true);
  };

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  const legalStructure = LookupLegalStructureById(userData?.profileData.legalStructureId);
  const legalStructureName = (
    {
      "limited-liability-company": Config.businessFormationDefaults.llcText,
      "limited-liability-partnership": Config.businessFormationDefaults.llpText,
      "limited-partnership": Config.businessFormationDefaults.lpText,
      "c-corporation": Config.businessFormationDefaults.cCorpText,
      "s-corporation": Config.businessFormationDefaults.sCorpText,
    } as Record<FormationLegalType, string>
  )[legalStructure.id as FormationLegalType];

  if (!userData) {
    return <></>;
  }

  return (
    <>
      <div className="flex space-between margin-bottom-2 flex-align-center">
        <div className="maxw-mobile-lg ">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.businessNameAndLegalStructureHeader}
          </Content>
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

      <div className="min-height-575rem bg-base-lightest margin-bottom-1 display-block tablet:display-flex tablet:flex-row">
        <div className="padding-205 flex-half">
          <Content>{Config.businessFormationDefaults.reviewStepBusinessNameLabel}</Content>
          <span className="text-accent-cool-darker">
            {userData.formationData.formationFormData.businessName ||
              Config.businessFormationDefaults.notSetBusinessNameText}
          </span>{" "}
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
          <span>{legalStructureName}</span>{" "}
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
