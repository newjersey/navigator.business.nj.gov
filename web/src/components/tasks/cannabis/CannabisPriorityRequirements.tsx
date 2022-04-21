import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { noneOfTheAbovePriorityId, priorityTypesObj } from "@/lib/domain-logic/cannabisPriorityTypes";
import { CannabisPriorityStatusDisplayContent } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useState } from "react";

interface Props {
  displayContent: CannabisPriorityStatusDisplayContent;
  onBack: () => void;
  onComplete: () => void;
}

export const CannabisPriorityRequirements = (props: Props): ReactElement => {
  const [displayMWPriorityType, setDisplayMWPriorityType] = useState(false);
  const [displayVeteranPriorityType, setDisplayVeteranPriorityType] = useState(false);
  const [displayImpactZonePriorityType, setDisplayImpactZonePriorityType] = useState(false);
  const [displaySocialEquityPriorityType, setDisplaySocialEquityPriorityType] = useState(false);
  const [displayNoPriorityType, setDisplayNoPriorityType] = useState(false);
  const { userData } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    const minorityOrWomenPriorityTypeSelected = priorityTypesObj.minorityOrWomen.some(
      (key) => userData.taskItemChecklist[key] === true
    );
    const veteranPriorityTypeSelected = priorityTypesObj.veteran.some(
      (key) => userData.taskItemChecklist[key] === true
    );

    const impactZonePriorityTypeSelected = priorityTypesObj.impactZone.some(
      (key) => userData.taskItemChecklist[key] === true
    );

    const socialEquityPriorityTypeSelected = priorityTypesObj.socialEquity.some(
      (key) => userData.taskItemChecklist[key] === true
    );

    setDisplayMWPriorityType(minorityOrWomenPriorityTypeSelected);
    setDisplayVeteranPriorityType(veteranPriorityTypeSelected);
    setDisplayImpactZonePriorityType(impactZonePriorityTypeSelected);
    setDisplaySocialEquityPriorityType(socialEquityPriorityTypeSelected);
    setDisplayNoPriorityType(!!userData.taskItemChecklist[noneOfTheAbovePriorityId]);
  }, [userData]);

  const showTaskCompleteButton = () => {
    if (displayNoPriorityType) return true;
    return (
      displayImpactZonePriorityType &&
      !displayMWPriorityType &&
      !displayVeteranPriorityType &&
      !displaySocialEquityPriorityType &&
      !displayNoPriorityType
    );
  };

  return (
    <>
      {!displayNoPriorityType && (
        <>
          <div className="margin-bottom-3">{Config.cannabisPriorityStatus.secondTabDescriptionText}</div>
          <h2>{Config.cannabisPriorityStatus.secondTabHeaderText}</h2>
        </>
      )}
      {displayMWPriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.minorityOrWomenHeaderText}</h3>
          <Content>{props.displayContent.genericMinorityAndWomenOwned.contentMd}</Content>
          {!displaySocialEquityPriorityType &&
            !displayImpactZonePriorityType &&
            !displayVeteranPriorityType && <hr className="margin-y-3" />}
        </>
      )}
      {displayVeteranPriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.veteranHeaderText}</h3>
          <Content>{props.displayContent.genericVeteranOwned.contentMd}</Content>
          {!displaySocialEquityPriorityType && !displayImpactZonePriorityType && (
            <hr className="margin-y-3" />
          )}
        </>
      )}
      {displaySocialEquityPriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.socialEquityHeaderText}</h3>
          <Content>{props.displayContent.cannabisSocialEquityBusiness.contentMd}</Content>
          {!displayImpactZonePriorityType && <hr className="margin-y-3" />}
        </>
      )}
      {displayImpactZonePriorityType && (
        <>
          <hr className="margin-y-3" />
          <h3>{Config.cannabisPriorityStatus.impactZoneHeaderText}</h3>
          <div>{Config.cannabisPriorityStatus.impactZoneText}</div>
          <hr className="margin-y-3" />
        </>
      )}
      {displayNoPriorityType && (
        <>
          <div>{Config.cannabisPriorityStatus.noPriorityStatusText}</div>
        </>
      )}
      {(displayMWPriorityType || displayVeteranPriorityType || displaySocialEquityPriorityType) && (
        <>
          <div className="green-box text-normal padding-2 margin-top-2 bg-success-lighter radius-lg">
            <div className="text-bold">{Config.cannabisPriorityStatus.greenBoxBoldedText}</div>
            <ul>
              {displayMWPriorityType && <li>{Config.cannabisPriorityStatus.greenBoxMinorityOrWomenText}</li>}
              {displayVeteranPriorityType && <li>{Config.cannabisPriorityStatus.greenBoxVeteranText}</li>}
              {displaySocialEquityPriorityType && (
                <li>{Config.cannabisPriorityStatus.greenBoxSocialEquityText}</li>
              )}
            </ul>
          </div>
        </>
      )}
      <div className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-top-3 margin-bottom-neg-205">
        <Button style="secondary" dataTestid="backButton" onClick={props.onBack}>
          {Config.cannabisPriorityStatus.backButtonText}
        </Button>
        {displaySocialEquityPriorityType && (
          <a
            href={Config.cannabisPriorityStatus.socialEquityButtonLink}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button
              style="primary"
              dataTestid="socialEquityButton"
              noRightMargin={!(displayMWPriorityType || displayVeteranPriorityType)}
            >
              {Config.cannabisPriorityStatus.socialEquityButtonText}
            </Button>
          </a>
        )}
        {(displayMWPriorityType || displayVeteranPriorityType) && (
          <a
            href={Config.cannabisPriorityStatus.certificationButtonLink}
            target="_blank"
            rel="noreferrer noopener"
          >
            <Button style="primary" dataTestid="certificationButton" noRightMargin>
              {Config.cannabisPriorityStatus.certificationButtonText}
            </Button>
          </a>
        )}
        {showTaskCompleteButton() && (
          <Button
            style="primary"
            noRightMargin
            dataTestid="completeTaskProgressButton"
            onClick={props.onComplete}
          >
            {Config.cannabisPriorityStatus.completeTaskProgressButtonText}
          </Button>
        )}
      </div>
    </>
  );
};
