import { Content } from "@/components/Content";
import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ModifiedContent } from "@/components/ModifiedContent";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext, useState } from "react";

interface Props {
  isReviewStep?: boolean;
}

export const BusinessNameAndLegalStructure = ({ isReviewStep = false }: Props): ReactElement => {
  const { Config } = useConfig();
  const [legalStructureWarningIsOpen, setLegalStructureWarningIsOpen] = useState<boolean>(false);
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { userData } = useUserData();
  const router = useRouter();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const editLegalStructure = (): void => {
    analytics.event.business_formation_legal_structure_modal.submit.go_to_profile_screen();
    router.push("/profile?path=businessFormation");
  };

  const showLegalStructureModal = (): void => {
    analytics.event.business_formation_legal_structure_edit.click.show_legal_structure_modal();
    setLegalStructureWarningIsOpen(true);
  };

  const legalStructureName = (): string => {
    if (!userData || !userData.profileData.legalStructureId) return "";
    const preface =
      userData?.profileData.businessPersona === "FOREIGN"
        ? `${Config.formation.legalStructure.foreignPrefaceText} `
        : "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const legalStructure = (Config.formation.legalStructure as any)[userData.profileData.legalStructureId];
    return `${preface} ${legalStructure}`;
  };

  if (!userData) {
    return <></>;
  }

  const legalStructureContextualInfo = (): ReactElement => {
    const label = Config.formation.legalStructure.label;
    const contextualInfo = Config.formation.legalStructure.contextualInfo;
    return <ContextualInfoButton text={isReviewStep ? `${label}:` : label} id={contextualInfo} />;
  };

  const businessName = (): string => {
    const label = Config.formation.fields.businessName.label;
    return isReviewStep ? `${label}:` : label;
  };

  return (
    <>
      <div className="flex space-between margin-bottom-2 flex-align-center">
        <div className="maxw-mobile-lg ">
          <h2 className="h3-styling">{Config.formation.sections.businessNameAndStructureHeader}</h2>
        </div>
      </div>

      <div
        className={`min-height-575rem bg-base-lightest margin-bottom-1 ${
          isTabletAndUp ? "display-flex" : "display-block flex-row"
        }`}
      >
        <div className="padding-205 flex-half">
          <div>
            <strong>
              <ModifiedContent>{businessName()}</ModifiedContent>
            </strong>
          </div>
          <span className="text-accent-cool-darker">
            {state.formationFormData.businessName || Config.formation.general.notEntered} {""}
          </span>
          {!isReviewStep && (
            <UnStyledButton
              style="tertiary"
              widthAutoOnMobile
              onClick={(): void => setStepIndex(LookupStepIndexByName("Name"))}
              underline
              dataTestid="edit-business-name"
            >
              {Config.formation.general.editButtonText}
            </UnStyledButton>
          )}
        </div>
        <div
          className="padding-bottom-205 padding-x-205 tablet:padding-205 flex-half"
          data-testid="legal-structure"
        >
          <div className={"fdc"}>
            <strong className={"margin-bottom-05"}>{legalStructureContextualInfo()}</strong>
            <div className={"flex"}>
              <div className={"margin-right-05"}> {legalStructureName()}</div>
              <div>
                {!isReviewStep && (
                  <UnStyledButton
                    style="tertiary"
                    widthAutoOnMobile
                    onClick={showLegalStructureModal}
                    underline
                    dataTestid="edit-legal-structure"
                  >
                    {Config.formation.general.editButtonText}
                  </UnStyledButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ModalTwoButton
        isOpen={legalStructureWarningIsOpen}
        close={(): void => setLegalStructureWarningIsOpen(false)}
        title={Config.formation.legalStructure.warningModalHeader}
        primaryButtonText={Config.formation.legalStructure.warningModalContinueButton}
        primaryButtonOnClick={editLegalStructure}
        secondaryButtonText={Config.formation.legalStructure.warningModalCancelButton}
      >
        <Content>{Config.formation.legalStructure.warningModalBody}</Content>
      </ModalTwoButton>
    </>
  );
};
