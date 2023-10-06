import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { PrimaryButtonDropdown } from "@/components/njwds-extended/PrimaryButtonDropdown";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { noneOfTheAbovePriorityId, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
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
    const ctaButtons = [];
    if (displaySocialEquityPriorityType) {
      ctaButtons.push({
        text: Config.cannabisPriorityStatus.socialEquityButtonText,
        onClick: () => {
          return openInNewTab(Config.cannabisPriorityStatus.socialEquityButtonLink);
        },
      });
    }
    if (displayMWPriorityType || displayVeteranPriorityType) {
      ctaButtons.push({
        text: Config.cannabisPriorityStatus.certificationButtonText,
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
        <PrimaryButton isColor="primary" onClick={ctaButtons[0].onClick}>
          {ctaButtons[0].text}
        </PrimaryButton>
      );
    } else if (ctaButtons.length > 1) {
      return (
        <PrimaryButtonDropdown dropdownOptions={ctaButtons}>
          {Config.cannabisPriorityStatus.dropdownCTAButtonText}
        </PrimaryButtonDropdown>
      );
    } else {
      return <></>;
    }
  };

  return (
    <>
      <div className="margin-bottom-3">
        {!displayNoPriorityType && (
          <>
            <div className="margin-bottom-3">{Config.cannabisPriorityStatus.secondTabDescriptionText}</div>
            <h2>{Config.cannabisPriorityStatus.secondTabHeaderText}</h2>
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
                <h3 className="margin-y-3">{Config.cannabisPriorityStatus.minorityOrWomenHeaderText}</h3>
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
                <h3 className="margin-y-3">{Config.cannabisPriorityStatus.veteranHeaderText}</h3>
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
                <h3 className="margin-y-3">{Config.cannabisPriorityStatus.socialEquityHeaderText}</h3>
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
                <h3 className="margin-y-3">{Config.cannabisPriorityStatus.impactZoneHeaderText}</h3>
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
            <div className="green-box text-normal padding-2 margin-top-2 bg-primary-extra-light radius-lg">
              <div className="text-bold">{Config.cannabisPriorityStatus.greenBoxBoldedText}</div>
              <ul>
                {displayMWPriorityType && (
                  <li>{Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText}</li>
                )}
                {displayVeteranPriorityType && <li>{Config.cannabisPriorityStatus.greenBoxVeteranText}</li>}
                {displaySocialEquityPriorityType && (
                  <li>{Config.cannabisPriorityStatus.greenBoxSocialEquityText}</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
      <div
        style={{ marginTop: "auto" }}
        className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-bottom-neg-4 flex-column mobile-lg:flex-row radius-bottom-lg"
      >
        <div className="mobile-lg:margin-bottom-0 margin-bottom-1">
          <SecondaryButton isColor="primary" dataTestId="backButton" onClick={props.onBack}>
            {Config.cannabisPriorityStatus.backButtonText}
          </SecondaryButton>
        </div>
        {renderCTAButtons()}
      </div>
    </>
  );
};
