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
    fieldName,
    value,
  }: {
    fieldName: keyof typeof Config.formation.fields;
    value: InFormInBylaws;
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

    const bodyText = (Config.formation.fields[fieldName] as any).body;

    return (
      <div data-testid={fieldName}>
        <span>
          <strong>{bodyText}</strong> {endOfSentence && <>{endOfSentence}.</>}
        </span>
        {value === undefined && (
          <div className="display-inline-block padding-left-1">
            <ReviewNotEntered />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <hr className="margin-y-205" />
      <ReviewSubSection header={"Provisions"}>
        <div className="margin-top-2" data-testid="hasNonprofitBoardMembers">
          {hasNonprofitBoardMembers === true && (
            <Content>{Config.formation.fields.hasNonprofitBoardMembers.yesReviewText}</Content>
          )}
          {hasNonprofitBoardMembers === false && (
            <Content>{Config.formation.fields.hasNonprofitBoardMembers.noReviewText}</Content>
          )}
          {hasNonprofitBoardMembers === undefined && (
            <ReviewLineItem label={Config.formation.fields.hasNonprofitBoardMembers.label} value="" />
          )}
        </div>

        <div className="margin-top-2">
          {hasNonprofitBoardMembers &&
            showQuestionAnswer({
              fieldName: "nonprofitBoardMemberQualificationsSpecified",
              value: nonprofitBoardMemberQualificationsSpecified,
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
              fieldName: "nonprofitBoardMemberRightsSpecified",
              value: nonprofitBoardMemberRightsSpecified,
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
              fieldName: "nonprofitTrusteesMethodSpecified",
              value: nonprofitTrusteesMethodSpecified,
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
              fieldName: "nonprofitAssetDistributionSpecified",
              value: nonprofitAssetDistributionSpecified,
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
