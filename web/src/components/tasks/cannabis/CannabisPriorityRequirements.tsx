import { Callout } from "@/components/Callout";
import { Content } from "@/components/Content";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PrimaryButtonDropdown } from "@/components/njwds-extended/PrimaryButtonDropdown";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { noneOfTheAbovePriorityId, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { CallToActionHyperlink } from "@/lib/types/types";
import { openInNewTab, useMountEffect, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement, ReactNode, useState } from "react";

interface Props {
  onBack: () => void;
  onComplete: () => void;
  CMS_ONLY_tab?: string; // for CMS only
}

export const CannabisPriorityRequirements = (props: Props): ReactElement => {
  const [displayMWPriorityType, setDisplayMWPriorityType] = useState(false);
  const [displayVeteranPriorityType, setDisplayVeteranPriorityType] = useState(false);
  const [displayImpactZonePriorityType, setDisplayImpactZonePriorityType] = useState(false);
  const [displaySocialEquityPriorityType, setDisplaySocialEquityPriorityType] = useState(false);
  const [displayNoPriorityType, setDisplayNoPriorityType] = useState(false);
  const { business } = useUserData();
  const { Config } = useConfig();

  useMountEffect(() => {
    if (props.CMS_ONLY_tab) {
      setDisplayMWPriorityType(true);
      setDisplayVeteranPriorityType(true);
      setDisplayImpactZonePriorityType(true);
      setDisplaySocialEquityPriorityType(true);
    }
  });

  useMountEffectWhenDefined(() => {
    if (!business) return;
    const minorityOrWomenPriorityTypeSelected = priorityTypesObj.minorityOrWomen.some((key) => {
      return business.taskItemChecklist[key];
    });
    const veteranPriorityTypeSelected = priorityTypesObj.veteran.some((key) => {
      return business.taskItemChecklist[key];
    });

    const impactZonePriorityTypeSelected = priorityTypesObj.impactZone.some((key) => {
      return business.taskItemChecklist[key];
    });

    const socialEquityPriorityTypeSelected = priorityTypesObj.socialEquity.some((key) => {
      return business.taskItemChecklist[key];
    });

    setDisplayMWPriorityType(minorityOrWomenPriorityTypeSelected);
    setDisplayVeteranPriorityType(veteranPriorityTypeSelected);
    setDisplayImpactZonePriorityType(impactZonePriorityTypeSelected);
    setDisplaySocialEquityPriorityType(socialEquityPriorityTypeSelected);
    setDisplayNoPriorityType(!!business.taskItemChecklist[noneOfTheAbovePriorityId]);
  }, [business]);

  const showTaskCompleteButton = (): boolean => {
    if (displayNoPriorityType) {
      return true;
    }
    return (
      displayImpactZonePriorityType &&
      !displayMWPriorityType &&
      !displayVeteranPriorityType &&
      !displaySocialEquityPriorityType &&
      !displayNoPriorityType
    );
  };

  const renderCTAButtons = (): ReactNode => {
    const ctaButtons: CallToActionHyperlink[] = [];
    if (displaySocialEquityPriorityType) {
      ctaButtons.push({
        text: Config.cannabisPriorityStatus.socialEquityButtonText,
        destination: Config.cannabisPriorityStatus.socialEquityButtonLink,
        onClick: () => {
          return openInNewTab(Config.cannabisPriorityStatus.socialEquityButtonLink);
        },
      });
    }
    if (displayMWPriorityType || displayVeteranPriorityType) {
      ctaButtons.push({
        text: Config.cannabisPriorityStatus.certificationButtonText,
        destination: Config.cannabisPriorityStatus.certificationButtonLink,
        onClick: () => {
          return openInNewTab(Config.cannabisPriorityStatus.certificationButtonLink);
        },
      });
    }
    if (showTaskCompleteButton()) {
      return (
        <PrimaryButton isColor="primary" isRightMarginRemoved={true} onClick={props.onComplete}>
          {Config.cannabisPriorityStatus.completeTaskProgressButtonText}
        </PrimaryButton>
      );
    } else if (ctaButtons.length === 1) {
      return (
        <PrimaryButton isColor="primary" isRightMarginRemoved={true} onClick={ctaButtons[0].onClick}>
          {ctaButtons[0].text}
        </PrimaryButton>
      );
    } else if (ctaButtons.length > 1) {
      return (
        <PrimaryButtonDropdown dropdownOptions={ctaButtons} isRightMarginRemoved={true}>
          {Config.cannabisPriorityStatus.dropdownCTAButtonText}
        </PrimaryButtonDropdown>
      );
    } else {
      return <></>;
    }
  };

  return (
    <div className="flex flex-column space-between min-height-29rem">
      <div className="margin-bottom-3">
        {!displayNoPriorityType && (
          <>
            <div className="margin-bottom-3">{Config.cannabisPriorityStatus.secondTabDescriptionText}</div>
            <Heading level={2}>{Config.cannabisPriorityStatus.secondTabHeaderText}</Heading>
          </>
        )}
        {displayMWPriorityType && (
          <>
            <hr />
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
                aria-controls={`${Config.cannabisPriorityStatus.minorityOrWomenHeaderText}-content`}
              >
                <Heading level={3} className="margin-y-3">
                  {Config.cannabisPriorityStatus.minorityOrWomenHeaderText}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{Config.cannabisPriorityStatus.minorityWomenOwnedRequirements}</Content>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {displayVeteranPriorityType && (
          <>
            <hr />
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
                aria-controls={`${Config.cannabisPriorityStatus.veteranHeaderText}-content`}
              >
                <Heading level={3} className="margin-y-3">
                  {Config.cannabisPriorityStatus.veteranHeaderText}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{Config.cannabisPriorityStatus.veteranOwnedRequirements}</Content>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {displaySocialEquityPriorityType && (
          <>
            <hr />
            <Accordion defaultExpanded={true} className="margin-top-2">
              <AccordionSummary
                expandIcon={<Icon className="usa-icon--size-5 margin-left-1">expand_more</Icon>}
                aria-controls={`${Config.cannabisPriorityStatus.socialEquityHeaderText}-content`}
              >
                <Heading level={3} className="margin-y-3">
                  {Config.cannabisPriorityStatus.socialEquityHeaderText}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{Config.cannabisPriorityStatus.socialEquityRequirements}</Content>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {displayImpactZonePriorityType && (
          <>
            <hr />
            <Accordion expanded={true} className="margin-top-2">
              <AccordionSummary
                aria-controls={`${Config.cannabisPriorityStatus.impactZoneHeaderText}-content`}
              >
                <Heading level={3} className="margin-y-3">
                  {Config.cannabisPriorityStatus.impactZoneHeaderText}
                </Heading>
              </AccordionSummary>
              <AccordionDetails>
                <Content>{Config.cannabisPriorityStatus.impactZoneText}</Content>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {displayNoPriorityType && <div>{Config.cannabisPriorityStatus.noPriorityStatusText}</div>}
        {(displayMWPriorityType || displayVeteranPriorityType || displaySocialEquityPriorityType) && (
          <>
            <hr />
            <Callout
              calloutType="conditional"
              headerText={Config.cannabisPriorityStatus.greenBoxHeadingText}
              showIcon={true}
            >
              <ul>
                {displayMWPriorityType && (
                  <li>{Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText}</li>
                )}
                {displayVeteranPriorityType && <li>{Config.cannabisPriorityStatus.greenBoxVeteranText}</li>}
                {displaySocialEquityPriorityType && (
                  <li>{Config.cannabisPriorityStatus.greenBoxSocialEquityText}</li>
                )}
              </ul>
            </Callout>
          </>
        )}
      </div>

      <CtaContainer>
        <ActionBarLayout>
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton isColor="primary" dataTestId="backButton" onClick={props.onBack}>
              {Config.cannabisPriorityStatus.backButtonText}
            </SecondaryButton>
          </div>
          {renderCTAButtons()}
        </ActionBarLayout>
      </CtaContainer>
    </div>
  );
};
