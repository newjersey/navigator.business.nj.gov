import React, { ReactElement, useEffect, useState } from "react";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import analytics from "@/lib/utils/analytics";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { OnboardingData } from "@/lib/types/types";
import { LookupIndustryById } from "@businessnjgovnavigator/shared";
import { LegalStructureLookup } from "@/display-content/LegalStructureLookup";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMediaQuery } from "@mui/material";
import { MediaQueries } from "@/lib/PageSizes";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";

interface Props {
  onboardingData: OnboardingData;
}

export const MiniProfile = (props: Props): ReactElement => {
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const { isLoading } = useUserData();
  const [showingAll, setShowingAll] = useState(!isMobile);

  useEffect(() => {
    setShowingAll(!isMobile);
  }, [isMobile, setShowingAll]);

  const getBusinessName = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.onboardingData.businessName
      ? props.onboardingData.businessName
      : RoadmapDefaults.greyBoxNotSetText;
  };

  const getIndustry = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.onboardingData.industryId && props.onboardingData.industryId !== "generic"
      ? LookupIndustryById(props.onboardingData.industryId).name
      : RoadmapDefaults.greyBoxSomeOtherIndustryText;
  };

  const getLegalStructure = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.onboardingData.legalStructure
      ? LegalStructureLookup[props.onboardingData.legalStructure]
      : RoadmapDefaults.greyBoxNotSetText;
  };

  const getMunicipality = (): string => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.onboardingData.municipality
      ? props.onboardingData.municipality.displayName
      : RoadmapDefaults.greyBoxNotSetText;
  };

  return (
    <div className="margin-top-3 font-body-2xs padding-3 bg-base-lightest border-base-lighter border-1px">
      <div className="fdr">
        <h2 className="margin-top-0">{RoadmapDefaults.greyBoxHeaderText}</h2>
        <div className="mla font-body-sm">
          <a
            href="/profile"
            onClick={() => analytics.event.roadmap_profile_edit_button.click.return_to_onboarding()}
            data-testid="grey-callout-link"
          >
            {RoadmapDefaults.greyBoxEditText}
          </a>
        </div>
      </div>
      <div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col-6">
            <div data-business-name={props.onboardingData.businessName}>
              <strong>{RoadmapDefaults.greyBoxBusinessNameText}:</strong> {getBusinessName()}
            </div>
            <div data-industry={props.onboardingData.industryId}>
              <strong>{RoadmapDefaults.greyBoxIndustryText}:</strong> {getIndustry()}
            </div>
            <div data-legal-structure={props.onboardingData.legalStructure}>
              <strong>{RoadmapDefaults.greyBoxLegalStructureText}:</strong> {getLegalStructure()}
            </div>
            <div data-municipality={props.onboardingData.municipality?.name}>
              <strong>{RoadmapDefaults.greyBoxMunicipalityText}:</strong> {getMunicipality()}
            </div>
          </div>

          {showingAll && (
            <div className={`tablet:grid-col-6 ${isMobile ? "margin-top-1" : ""}`}>
              {props.onboardingData.employerId && (
                <div>
                  <strong>{RoadmapDefaults.greyBoxEINText}:</strong>{" "}
                  {displayAsEin(props.onboardingData.employerId)}
                </div>
              )}
              {props.onboardingData.entityId && isEntityIdApplicable(props.onboardingData.legalStructure) && (
                <div>
                  <strong>{RoadmapDefaults.greyBoxEntityIdText}:</strong> {props.onboardingData.entityId}
                </div>
              )}
              {props.onboardingData.taxId && (
                <div>
                  <strong>{RoadmapDefaults.greyBoxTaxIdText}:</strong> {props.onboardingData.taxId}
                </div>
              )}
              {props.onboardingData.notes && (
                <div className="truncate">
                  <strong>{RoadmapDefaults.greyBoxNotesText}:</strong> {props.onboardingData.notes}
                </div>
              )}
            </div>
          )}
        </div>

        {isMobile && (
          <button
            className="usa-button usa-button--unstyled underline font-body-2xs margin-top-2"
            onClick={() => setShowingAll(!showingAll)}
          >
            {showingAll ? RoadmapDefaults.greyBoxViewLessText : RoadmapDefaults.greyBoxViewMoreText}
          </button>
        )}
      </div>
    </div>
  );
};
