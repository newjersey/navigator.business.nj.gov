import { Content } from "@/components/Content";
import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { InFormInBylaws } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ReviewNonprofitProvisions = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const {
    hasNonprofitBoardMembers,
    nonprofitBoardMembersTerms,
    nonprofitBoardMemberQualificationsSpecified,
    nonprofitBoardMemberQualificationsTerms,
    nonprofitBoardMemberRightsSpecified,
    nonprofitBoardMemberRightsTerms,
    nonprofitTrusteesMethodSpecified,
    nonprofitTrusteesMethodTerms,
    nonprofitAssetDistributionSpecified,
    nonprofitAssetDistributionTerms,
  } = state.formationFormData;

  const isVisibleInReview = (value: InFormInBylaws): boolean => {
    return value === "IN_FORM";
  };

  const showQuestionAnswer = ({
    testId,
    value,
    reviewText,
  }: {
    testId: string;
    value: InFormInBylaws;
    reviewText: string;
  }): ReactElement => {
    const endOfSentence = ((): string => {
      switch (value) {
        case "IN_FORM":
          return Config.formation.nonprofitProvisions.radioInFormText.toLowerCase();
        case "IN_BYLAWS":
          return Config.formation.nonprofitProvisions.radioInBylawsText.toLowerCase();
        default:
          return "";
      }
    })();

    return (
      <>
        <div data-testid={testId} style={{ display: "inline-block" }}>
          <strong>{reviewText}</strong>{" "}
          {endOfSentence && (
            <>
              <span>{endOfSentence}</span>.
            </>
          )}
        </div>
        {value === undefined && (
          <div style={{ display: "inline-block", paddingLeft: "5px" }}>
            <ReviewNotEntered />
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <hr className="margin-y-205" />
      <ReviewSubSection header={"Provisions"}>
        <div className="margin-top-2" data-testid="hasNonprofitBoardMembers">
          {hasNonprofitBoardMembers === true && (
            <Content>{Config.formation.fields.nonprofit.yesBoardMembersReviewText}</Content>
          )}
          {hasNonprofitBoardMembers === false && (
            <Content>{Config.formation.fields.nonprofit.noBoardMembersReviewText}</Content>
          )}
          {hasNonprofitBoardMembers === undefined && (
            <ReviewLineItem label={Config.formation.fields.hasNonprofitBoardMembers.label} value="" />
          )}
        </div>

        <div className="margin-top-2 margin-left-3">
          <ExpandCollapseString
            text={nonprofitBoardMembersTerms}
            viewMoreText={Config.formation.general.viewMoreButtonText}
            viewLessText={Config.formation.general.viewLessButtonText}
            lines={2}
          />
        </div>

        <div className="margin-top-2">
          {hasNonprofitBoardMembers &&
            showQuestionAnswer({
              testId: "nonprofitBoardMemberQualificationsSpecified",
              value: nonprofitBoardMemberQualificationsSpecified,
              reviewText: Config.formation.fields.nonprofit.boardMembersQualificationsReviewText,
            })}
        </div>

        {isVisibleInReview(nonprofitBoardMemberQualificationsSpecified) && (
          <div className="margin-top-2 margin-left-3">
            <ExpandCollapseString
              text={nonprofitBoardMemberQualificationsTerms}
              viewMoreText={Config.formation.general.viewMoreButtonText}
              viewLessText={Config.formation.general.viewLessButtonText}
              lines={2}
            />
          </div>
        )}

        <div className="margin-top-2">
          {hasNonprofitBoardMembers &&
            showQuestionAnswer({
              testId: "nonprofitBoardMemberRightsSpecified",
              value: nonprofitBoardMemberRightsSpecified,
              reviewText: Config.formation.fields.nonprofit.rightsAndLimitationsReviewText,
            })}
        </div>

        {isVisibleInReview(nonprofitBoardMemberRightsSpecified) && (
          <div className="margin-top-2 margin-left-3">
            <ExpandCollapseString
              text={nonprofitBoardMemberRightsTerms}
              viewMoreText={Config.formation.general.viewMoreButtonText}
              viewLessText={Config.formation.general.viewLessButtonText}
              lines={2}
            />
          </div>
        )}

        <div className="margin-top-2">
          {hasNonprofitBoardMembers &&
            showQuestionAnswer({
              testId: "nonprofitTrusteesMethodSpecified",
              value: nonprofitTrusteesMethodSpecified,
              reviewText: Config.formation.fields.nonprofit.choosingTrusteesReviewText,
            })}
        </div>

        {isVisibleInReview(nonprofitTrusteesMethodSpecified) && (
          <div className="margin-top-2 margin-left-3">
            <ExpandCollapseString
              text={nonprofitTrusteesMethodTerms}
              viewMoreText={Config.formation.general.viewMoreButtonText}
              viewLessText={Config.formation.general.viewLessButtonText}
              lines={2}
            />
          </div>
        )}

        <div className="margin-top-2">
          {hasNonprofitBoardMembers &&
            showQuestionAnswer({
              testId: "nonprofitAssetDistributionSpecified",
              value: nonprofitAssetDistributionSpecified,
              reviewText: Config.formation.fields.nonprofit.distributingAssetsReviewText,
            })}
        </div>

        {isVisibleInReview(nonprofitAssetDistributionSpecified) && (
          <div className="margin-top-2 margin-left-3">
            <ExpandCollapseString
              text={nonprofitAssetDistributionTerms}
              viewMoreText={Config.formation.general.viewMoreButtonText}
              viewLessText={Config.formation.general.viewLessButtonText}
              lines={2}
            />
          </div>
        )}
      </ReviewSubSection>
    </>
  );
};
