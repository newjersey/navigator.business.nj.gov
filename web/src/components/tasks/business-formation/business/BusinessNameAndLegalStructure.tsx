import { Content } from "@/components/Content";
import { ContextualInfoButton } from "@/components/ContextualInfoButton";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { ModifiedContent } from "@/components/ModifiedContent";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { businessStructureTaskId } from "@businessnjgovnavigator/shared/domain-logic/taskIds";
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
  const { business } = useUserData();
  const router = useRouter();
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const { roadmap } = useRoadmap();
  const businessStructureUrlSlug = roadmap
    ? (getTaskFromRoadmap(roadmap, businessStructureTaskId)?.urlSlug as string)
    : "";

  const editLegalStructure = (): void => {
    analytics.event.business_formation_legal_structure_modal.submit.go_to_profile_screen();
    router.push(`/tasks/${businessStructureUrlSlug}`);
  };

  const showLegalStructureModal = (): void => {
    analytics.event.business_formation_legal_structure_edit.click.show_legal_structure_modal();
    setLegalStructureWarningIsOpen(true);
  };

  const legalStructureName = (): string => {
    if (!business || !business.profileData.legalStructureId) return "";

    if (business.profileData.businessPersona === "FOREIGN") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (Config.formation.legalStructure.foreignLabels as any)[business.profileData.legalStructureId];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (Config.formation.legalStructure.domesticLabels as any)[business.profileData.legalStructureId];
    }
  };

  if (!business) {
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

  const notEnteredBusinessName = (): ReactElement => {
    if (isReviewStep) {
      return <ReviewNotEntered />;
    } else {
      return <span className="text-accent-cool-darker">{Config.formation.general.notEntered}</span>;
    }
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
          <div className="flex">
            <div className="margin-right-05">
              {state.formationFormData.businessName ? (
                <span className="text-accent-cool-darker">{state.formationFormData.businessName}</span>
              ) : (
                notEnteredBusinessName()
              )}
            </div>
            {!isReviewStep && (
              <UnStyledButton
                style="default"
                onClick={(): void => setStepIndex(LookupStepIndexByName("Name"))}
                isUnderline
                dataTestid="edit-business-name"
              >
                {Config.formation.general.editButtonText}
              </UnStyledButton>
            )}
          </div>
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
                    style="default"
                    onClick={showLegalStructureModal}
                    isUnderline
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
