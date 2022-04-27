import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import { CannabisApplyForLicenseDisplayContent, Task } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import React, { ReactElement } from "react";

interface Props {
  displayContent: CannabisApplyForLicenseDisplayContent;
  task: Task;
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onBack: () => void;
}

export const CannabisApplicationRequirementsTab = (props: Props): ReactElement => {
  const { userData } = useUserData();

  const hasPriorityStatus = (Object.keys(props.priorityStatusState) as PriorityApplicationType[]).some(
    (key) => props.priorityStatusState[key]
  );

  return (
    <div className="flex flex-column">
      <div className="margin-bottom-4">
        <Content>{Config.cannabisApplyForLicense.applicationPageHelperText}</Content>
        <h2 className="margin-top-2 text-normal">{Config.cannabisApplyForLicense.applicationNeedsHeader}</h2>
        <hr className="margin-y-3" />
        {props.task.id === "annual-license-cannabis" && (
          <div className="margin-top-2">
            <Accordion elevation={0} defaultExpanded={true}>
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.generalApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
              >
                <h3 className="text-normal">{Config.cannabisApplyForLicense.generalApplicationNeeds}</h3>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{props.displayContent.annualGeneralRequirements.contentMd}</Content>
              </AccordionDetails>
            </Accordion>
          </div>
        )}
        {props.task.id === "conditional-permit-cannabis" && (
          <div className="margin-top-2">
            <Accordion elevation={0} defaultExpanded={true}>
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.generalApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
              >
                <h3 className="text-normal">{Config.cannabisApplyForLicense.generalApplicationNeeds}</h3>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{props.displayContent.conditionalGeneralRequirements.contentMd}</Content>
              </AccordionDetails>
            </Accordion>
          </div>
        )}
        {userData?.profileData.cannabisMicrobusiness && (
          <div className="margin-top-2">
            <hr className="margin-y-3" />
            <Accordion elevation={0} defaultExpanded={false}>
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.microbusinessApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
              >
                <h3 className="text-normal">
                  {Config.cannabisApplyForLicense.microbusinessApplicationNeeds}
                </h3>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{props.displayContent.microbusinessRequirements.contentMd}</Content>
              </AccordionDetails>
            </Accordion>
          </div>
        )}
        {hasPriorityStatus && (
          <div className="margin-top-2">
            <hr className="margin-y-3" />
            <Accordion elevation={0} defaultExpanded={false}>
              <AccordionSummary
                aria-controls={`${Config.cannabisApplyForLicense.priorityStatusApplicationNeeds}-content`}
                expandIcon={<Icon className="usa-icon--size-5 margin-x-1">expand_more</Icon>}
              >
                <h3 className="text-normal">
                  {Config.cannabisApplyForLicense.priorityStatusApplicationNeeds}
                </h3>
              </AccordionSummary>
              <AccordionDetails>
                {props.priorityStatusState.diverselyOwned && (
                  <Content>{props.displayContent.diverselyOwnedRequirements.contentMd}</Content>
                )}
                {props.priorityStatusState.impactZone && (
                  <Content>{props.displayContent.impactZoneRequirements.contentMd}</Content>
                )}
                {props.priorityStatusState.socialEquity && (
                  <Content>{props.displayContent.socialEquityRequirements.contentMd}</Content>
                )}
              </AccordionDetails>
            </Accordion>
          </div>
        )}
        <hr className="margin-top-3 margin-bottom-4" />
        <Content>{props.task.contentMd}</Content>
      </div>

      <div
        style={{ marginTop: "auto" }}
        className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-bottom-neg-205 flex-column mobile-lg:flex-row"
      >
        <Button style="secondary" dataTestid="backButton" onClick={props.onBack}>
          {Config.cannabisPriorityStatus.backButtonText}
        </Button>
        <a
          className="mobile-lg:margin-top-0 margin-top-1"
          href={props.task.callToActionLink}
          target="_blank"
          rel="noreferrer noopener"
        >
          <Button style="primary" dataTestid="certificationButton" noRightMargin>
            {props.task.callToActionText}
          </Button>
        </a>
      </div>
    </div>
  );
};
