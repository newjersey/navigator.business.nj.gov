import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { businessFormationTabs } from "@/components/tasks/business-formation/businessFormationTabs";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/BusinessNameAndLegalStructure";
import { FormationContext } from "@/components/tasks/BusinessFormation";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import React, { ReactElement, useContext } from "react";

export const ReviewSection = (): ReactElement => {
  const { state, setTab } = useContext(FormationContext);
  const { userData } = useUserData();

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  const getBusinessSuffixAndStartDate = (
    <>
      <div className="display-block tablet:display-flex">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageBusinessSuffixLabel}</Content>
        </div>
        <div>
          {userData?.profileData.businessName} {state.formationFormData.businessSuffix}
        </div>
      </div>
      <div className="display-block tablet:display-flex margin-top-1">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageBusinessStartDateLabel}</Content>
        </div>
        <div>
          {parseDateWithFormat(state.formationFormData.businessStartDate, "YYYY-MM-DD").format("MM/DD/YYYY")}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );

  const getMainBusinessLocation = (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageLocationHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(businessFormationTabs.findIndex((obj) => obj.section === "Business"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-location-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="display-block tablet:display-flex">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageAddressLabel}</Content>
        </div>
        <div>
          {getStringifiedAddress(
            state.formationFormData.businessAddressLine1,
            userData?.profileData.municipality?.name as string,
            state.formationFormData.businessAddressState,
            state.formationFormData.businessAddressZipCode,
            state.formationFormData.businessAddressLine2
          )}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );

  const getRegisteredAgent = (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageRegisteredAgentHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(businessFormationTabs.findIndex((obj) => obj.section === "Business"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-registered-agent-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      {state.formationFormData.agentNumberOrManual === "NUMBER" && (
        <div className="display-block tablet:display-flex" data-testid="agent-number">
          <div className="text-bold width-11rem">
            <Content>{Config.businessFormationDefaults.reviewPageRegisteredAgentNumberLabel}</Content>
          </div>
          <div>{state.formationFormData.agentNumber}</div>
        </div>
      )}
      {state.formationFormData.agentNumberOrManual === "MANUAL_ENTRY" && (
        <div data-testid="agent-manual-entry">
          <div className="display-block tablet:display-flex">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageRegisteredAgentNameLabel}</Content>
            </div>
            <div>{state.formationFormData.agentName}</div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageEmailLabel}</Content>
            </div>
            <div>{state.formationFormData.agentEmail}</div>
          </div>
          <div className="display-block tablet:display-flex margin-top-1">
            <div className="text-bold width-11rem">
              <Content>{Config.businessFormationDefaults.reviewPageAddressLabel}</Content>
            </div>
            <div>
              {getStringifiedAddress(
                state.formationFormData.agentOfficeAddressLine1,
                state.formationFormData.agentOfficeAddressCity,
                state.formationFormData.agentOfficeAddressState,
                state.formationFormData.agentOfficeAddressZipCode,
                state.formationFormData.agentOfficeAddressLine2
              )}
            </div>
          </div>
        </div>
      )}

      <hr className="margin-y-205" />
    </>
  );

  const getMembers = (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageMembersHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(businessFormationTabs.findIndex((obj) => obj.section === "Contacts"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-members-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      {userData?.formationData.formationFormData.members.map((member, index) => (
        <div className="display-block tablet:display-flex" key={`${member.name}-${index}`}>
          <div className={`text-bold width-11rem ${index !== 0 ? "margin-top-1" : ""}`}>
            <Content>{Config.businessFormationDefaults.reviewPageMemberNameLabel}</Content>
          </div>
          <div className={index !== 0 ? "tablet:margin-top-1" : ""}>{member.name}</div>
        </div>
      ))}
      <hr className="margin-y-205" />
    </>
  );

  const getSignatures = (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageSignaturesHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(businessFormationTabs.findIndex((obj) => obj.section === "Contacts"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-signature-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="display-block tablet:display-flex">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageSignerNameLabel}</Content>
        </div>
        <div>{state.formationFormData.signer.name}</div>
      </div>
      {userData?.formationData.formationFormData.additionalSigners.map((signer, index) => (
        <div className="display-block tablet:display-flex" key={`${signer}-${index}`}>
          <div className="text-bold width-11rem margin-top-1">
            <Content>{Config.businessFormationDefaults.reviewPageSignerNameLabel}</Content>
          </div>
          <div className="tablet:margin-top-1">{signer.name}</div>
        </div>
      ))}
    </>
  );

  return (
    <>
      <div data-testid="review-section">
        <BusinessNameAndLegalStructure reviewPage />
        {getBusinessSuffixAndStartDate}
        {getMainBusinessLocation}
        {getRegisteredAgent}
        {state.formationFormData.members.length ? getMembers : null}
        {getSignatures}
      </div>

      <div className="margin-top-2">
        <div className="flex flex-justify-end bg-base-lightest margin-x-neg-205 padding-3 margin-top-3 margin-bottom-neg-205">
          <Button
            style="secondary"
            widthAutoOnMobile
            onClick={() => {
              setTab(state.tab - 1);
              scrollToTop();
            }}
          >
            {Config.businessFormationDefaults.previousButtonText}
          </Button>
          <Button
            style="primary"
            noRightMargin
            onClick={() => {
              analytics.event.business_formation_review_step_continue_button.click.go_to_next_formation_step();
              setTab(state.tab + 1);
              scrollToTop();
            }}
            widthAutoOnMobile
          >
            {Config.businessFormationDefaults.nextButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
