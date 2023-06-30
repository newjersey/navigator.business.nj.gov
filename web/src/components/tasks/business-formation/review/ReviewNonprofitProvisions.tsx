import { Content } from "@/components/Content";
import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewNonprofitProvisions = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const checkIfInFormOrBylaw = (stringToCompare: string | undefined): string => {
    if (stringToCompare === "IN_BYLAWS") {
      return ` ${Config.formation.nonprofitProvisions.radioInBylawsText.toLowerCase().replace('"', "")}.`;
    }

    if (stringToCompare === "IN_FORM") {
      return ` ${Config.formation.nonprofitProvisions.radioInFormText.toLowerCase().replace('"', "")}.`;
    }
    return " ";
  };

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

  const fillInByLawFormText = (stringToCompare: string | undefined, outputText: string): string => {
    return `${outputText}  ${checkIfInFormOrBylaw(`${stringToCompare}`)}`;
  };

  const isVisibleInReview = (stringToCompare: string | undefined): boolean => {
    if (stringToCompare === "IN_FORM") {
      return true;
    } else {
      return false;
    }
  };

  const showQuestionAnswer = (
    testId: string,
    questionString: string | undefined,
    outputText: string,
    isBold?: boolean
  ): ReactElement => {
    return (
      <>
        {isBold && (
          <div data-testid={testId} style={{ display: "inline-block" }}>
            <strong>{outputText}</strong>
            <div style={{ display: "inline-block" }}>{checkIfInFormOrBylaw(questionString)}</div>
          </div>
        )}
        {!isBold && (
          <div data-testid={testId}>
            <Content style={{ display: "inline-block" }}>
              {fillInByLawFormText(questionString, outputText)}
            </Content>
          </div>
        )}
        {questionString === undefined && (
          <div data-testid={testId} style={{ display: "inline-block", paddingLeft: "5px" }}>
            <span className={"bg-accent-warm-extra-light text-italic"}>
              <ReviewNotEntered />
            </span>
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <hr className="margin-y-205" />
      <ReviewSubSection header={"Provisions"}>
        <div className="margin-top-2">
          {hasNonprofitBoardMembers && (
            <Content>{Config.formation.fields.nonprofit.yesBoardMembersReviewText}</Content>
          )}
          {!hasNonprofitBoardMembers && (
            <Content>{Config.formation.fields.nonprofit.noBoardMembersReviewText}</Content>
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
            showQuestionAnswer(
              "nonprofitBoardMemberQualificationsSpecified",
              nonprofitBoardMemberQualificationsSpecified,
              Config.formation.fields.nonprofit.boardMembersQualificationsReviewText,
              true
            )}
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
            showQuestionAnswer(
              "nonprofitBoardMemberRightsSpecified",
              nonprofitBoardMemberRightsSpecified,
              Config.formation.fields.nonprofit.rightsAndLimitationsReviewText
            )}
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
            showQuestionAnswer(
              "nonprofitTrusteesMethodSpecified",
              nonprofitTrusteesMethodSpecified,
              Config.formation.fields.nonprofit.choosingTrusteesReviewText,
              true
            )}
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
            showQuestionAnswer(
              "nonprofitAssetDistributionSpecified",
              nonprofitAssetDistributionSpecified,
              Config.formation.fields.nonprofit.distributingAssetsReviewText,
              true
            )}
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
