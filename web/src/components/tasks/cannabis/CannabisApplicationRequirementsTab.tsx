import { Content } from "@/components/Content";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Task } from "@/lib/types/types";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  task: Task;
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onBack: () => void;
  CMS_ONLY_isAnnual?: boolean; // for CMS only
  CMS_ONLY_isConditional?: boolean; // for CMS only
}

export const CannabisApplicationRequirementsTab = (props: Props): ReactElement => {
  const { business } = useUserData();
  const { Config } = useConfig();

  const hasPriorityStatus = (Object.keys(props.priorityStatusState) as PriorityApplicationType[]).some(
    (key) => {
      return props.priorityStatusState[key];
    }
  );

  return (
    <div className="flex flex-column">
      <div className="margin-bottom-4">
        <Content>{Config.cannabisApplyForLicense.applicationPageHelperText}</Content>
        <hr />
        {(props.CMS_ONLY_isAnnual || props.task.id === "annual-license-cannabis") && (
          <>
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.generalApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
              >
                <Heading level={2} styleVariant="h3" className="margin-y-3-override">
                  {Config.cannabisApplyForLicense.generalApplicationNeeds}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <div data-testid="annualGeneralRequirements">
                  <Content>{Config.cannabisApplyForLicense.annualGeneralRequirements}</Content>
                </div>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {(props.CMS_ONLY_isConditional || props.task.id === "conditional-permit-cannabis") && (
          <>
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.generalApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
              >
                <Heading level={2} styleVariant="h3" className="margin-y-3-override">
                  {Config.cannabisApplyForLicense.generalApplicationNeeds}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <div data-testid="conditionalGeneralRequirements">
                  <Content>{Config.cannabisApplyForLicense.conditionalGeneralRequirements}</Content>
                </div>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {(props.CMS_ONLY_isAnnual || business?.profileData.cannabisMicrobusiness) && (
          <>
            <hr />
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.microbusinessApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
              >
                <Heading level={2} styleVariant="h3" className="margin-y-3-override">
                  {Config.cannabisApplyForLicense.microbusinessApplicationNeeds}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <div data-testid="microbusinessRequirements">
                  <Content>{Config.cannabisApplyForLicense.microbusinessRequirements}</Content>
                </div>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {hasPriorityStatus && (
          <>
            <hr />
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.priorityStatusApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
              >
                <Heading level={2} styleVariant="h3" className="margin-y-3-override">
                  {Config.cannabisApplyForLicense.priorityStatusApplicationNeeds}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                {props.priorityStatusState.diverselyOwned && (
                  <div data-testid="diverselyOwnedRequirements">
                    <Content>{Config.cannabisApplyForLicense.diverselyOwnedRequirements}</Content>
                  </div>
                )}
                {props.priorityStatusState.impactZone && (
                  <div data-testid="impactZoneRequirements">
                    <Content>{Config.cannabisApplyForLicense.impactZoneRequirements}</Content>
                  </div>
                )}
                {props.priorityStatusState.socialEquity && (
                  <div data-testid="socialEquityRequirements">
                    <Content>{Config.cannabisApplyForLicense.socialEquityRequirements}</Content>
                  </div>
                )}
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <hr className="margin-bottom-4" />
        {(props.CMS_ONLY_isConditional || props.task.id === "conditional-permit-cannabis") && (
          <Content>{Config.cannabisApplyForLicense.conditionalBottomOfTask}</Content>
        )}
        {(props.CMS_ONLY_isAnnual || props.task.id === "annual-license-cannabis") && (
          <Content>{Config.cannabisApplyForLicense.annualBottomOfTask}</Content>
        )}
      </div>

      <CtaContainer>
        <ActionBarLayout reverseInMobile={true}>
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton isColor="primary" dataTestId="backButton" onClick={props.onBack}>
              {Config.cannabisPriorityStatus.backButtonText}
            </SecondaryButton>
          </div>
          <a href={props.task.callToActionLink} target="_blank" rel="noreferrer noopener">
            <PrimaryButton isColor="primary" dataTestId="certificationButton" isRightMarginRemoved>
              {props.task.callToActionText}
            </PrimaryButton>
          </a>
        </ActionBarLayout>
      </CtaContainer>
    </div>
  );
};
