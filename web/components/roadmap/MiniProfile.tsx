import React, { ReactElement, useEffect, useState } from "react";
import { RoadmapDefaults } from "@/display-defaults/roadmap/RoadmapDefaults";
import analytics from "@/lib/utils/analytics";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { ProfileData } from "@/lib/types/types";
import { LookupIndustryById, LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMediaQuery } from "@mui/material";
import { MediaQueries } from "@/lib/PageSizes";
import { isEntityIdApplicable } from "@/lib/domain-logic/isEntityIdApplicable";
import { Button } from "../njwds-extended/Button";

interface Props {
  profileData: ProfileData;
}

export const MiniProfile = (props: Props): ReactElement => {
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const { isLoading } = useUserData();
  const [showingAll, setShowingAll] = useState(!isMobile);

  useEffect(() => {
    setShowingAll(!isMobile);
  }, [isMobile, setShowingAll]);

  const getBusinessName = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.businessName ? (
      props.profileData.businessName
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotSetText}</span>
    );
  };

  const getIndustry = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.industryId && props.profileData.industryId !== "generic" ? (
      LookupIndustryById(props.profileData.industryId).name
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotSetText}</span>
    );
  };

  const getLegalStructure = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.legalStructureId ? (
      LookupLegalStructureById(props.profileData.legalStructureId).name
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotSetText}</span>
    );
  };

  const getMunicipality = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.municipality ? (
      props.profileData.municipality.displayName
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotSetText}</span>
    );
  };

  const getEin = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.employerId ? (
      displayAsEin(props.profileData.employerId)
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotEnteredText}</span>
    );
  };

  const getEntityId = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.entityId ? (
      props.profileData.entityId
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotEnteredText}</span>
    );
  };

  const getTaxId = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.taxId ? (
      props.profileData.taxId
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotEnteredText}</span>
    );
  };

  const getNotes = (): string | ReactElement => {
    if (isLoading) return RoadmapDefaults.loadingText;
    return props.profileData.notes ? (
      props.profileData.notes
    ) : (
      <span className="text-base-dark text-italic">{RoadmapDefaults.greyBoxNotEnteredText}</span>
    );
  };

  return (
    <div className="margin-top-3 font-body-2xs padding-3 bg-base-lightest border-base-lighter border-1px">
      <div className="flex">
        <h2 className="margin-top-0 display-inline margin-right-2">{RoadmapDefaults.greyBoxHeaderText}</h2>
        <span className="mla font-body-sm">
          <a
            className="usa-link"
            href="/profile"
            onClick={() => analytics.event.roadmap_profile_edit_button.click.return_to_onboarding()}
            data-testid="grey-callout-link"
          >
            {RoadmapDefaults.greyBoxEditText}
          </a>
        </span>
      </div>
      <div>
        <div className="grid-row grid-gap margin-bottom-2">
          <div className="tablet:grid-col-6">
            <div data-testid="mini-profile-businessName" data-business-name={props.profileData.businessName}>
              <strong>{RoadmapDefaults.greyBoxBusinessNameText}:</strong> {getBusinessName()}
            </div>
            <div data-testid="mini-profile-industryId" data-industry={props.profileData.industryId}>
              <strong>{RoadmapDefaults.greyBoxIndustryText}:</strong> {getIndustry()}
            </div>
            <div
              data-testid="mini-profile-legal-structure"
              data-legal-structure={props.profileData.legalStructureId}
            >
              <strong>{RoadmapDefaults.greyBoxLegalStructureText}:</strong> {getLegalStructure()}
            </div>
            <div data-testid="mini-profile-location" data-municipality={props.profileData.municipality?.name}>
              <strong>{RoadmapDefaults.greyBoxMunicipalityText}:</strong> {getMunicipality()}
            </div>
          </div>

          {showingAll && (
            <div className={`tablet:grid-col-6 ${isMobile ? "margin-top-1" : ""}`}>
              <div data-testid="mini-profile-employerId">
                <strong>{RoadmapDefaults.greyBoxEINText}:</strong> {getEin()}
              </div>
              {isEntityIdApplicable(props.profileData.legalStructureId) && (
                <div data-testid="mini-profile-entityId">
                  <strong>{RoadmapDefaults.greyBoxEntityIdText}:</strong> {getEntityId()}
                </div>
              )}
              <div data-testid="mini-profile-taxId">
                <strong>{RoadmapDefaults.greyBoxTaxIdText}:</strong> {getTaxId()}
              </div>
              <div className={isMobile ? "" : "truncate"} data-testid="mini-profile-notes">
                <strong>{RoadmapDefaults.greyBoxNotesText}:</strong> {getNotes()}
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <Button style="tertiary" underline smallText onClick={() => setShowingAll(!showingAll)}>
            {showingAll ? RoadmapDefaults.greyBoxViewLessText : RoadmapDefaults.greyBoxViewMoreText}
          </Button>
        )}
      </div>
    </div>
  );
};
