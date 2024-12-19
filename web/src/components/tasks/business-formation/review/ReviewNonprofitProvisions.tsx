import { Content } from "@/components/Content";
import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewNotEntered } from "@/components/tasks/business-formation/review/section/ReviewNotEntered";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FormationFields, InFormInBylaws } from "@businessnjgovnavigator/shared";
import { Fragment, ReactElement, useContext } from "react";

export const ReviewNonprofitProvisions = (): ReactElement<any> => {
  const { state } = useContext(BusinessFormationContext);
  const { Config } = useConfig();

  const { hasNonprofitBoardMembers } = state.formationFormData;

  const showQuestionAnswer = ({
    fieldName,
    value,
  }: {
    fieldName: FormationFields;
    value: InFormInBylaws;
  }): ReactElement<any> => {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bodyText = ((Config.formation.fields as any)[fieldName] as any).body;

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

  const provisionsToDisplay: Array<{ radioField: FormationFields; termsField: FormationFields }> = [
    {
      radioField: "nonprofitBoardMemberQualificationsSpecified",
      termsField: "nonprofitBoardMemberQualificationsTerms",
    },
    { radioField: "nonprofitBoardMemberRightsSpecified", termsField: "nonprofitBoardMemberRightsTerms" },
    { radioField: "nonprofitTrusteesMethodSpecified", termsField: "nonprofitTrusteesMethodTerms" },
    { radioField: "nonprofitAssetDistributionSpecified", termsField: "nonprofitAssetDistributionTerms" },
  ];

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
            <ReviewLineItem label={Config.formation.fields.hasNonprofitBoardMembers.reviewLabel} value="" />
          )}
        </div>

        {provisionsToDisplay.map(({ radioField, termsField }) => {
          const radioValue = state.formationFormData[radioField] as InFormInBylaws;
          const termsValue = state.formationFormData[termsField] as string;

          return (
            <Fragment key={radioField}>
              <div className="margin-top-2">
                {hasNonprofitBoardMembers &&
                  showQuestionAnswer({
                    fieldName: radioField,
                    value: radioValue,
                  })}
              </div>

              {radioValue === "IN_FORM" && (
                <div className="margin-top-2 margin-left-3" data-testid={`${radioField}-terms`}>
                  {termsValue ? (
                    <ExpandCollapseString
                      text={termsValue}
                      viewMoreText={Config.formation.general.viewMoreButtonText}
                      viewLessText={Config.formation.general.viewLessButtonText}
                      lines={2}
                    />
                  ) : (
                    <div className="display-flex flex-row">
                      <span className="margin-right-1">
                        <strong>{Config.formation.nonprofitProvisions.description}:</strong>
                      </span>
                      <ReviewNotEntered />
                    </div>
                  )}
                </div>
              )}
            </Fragment>
          );
        })}
      </ReviewSubSection>
    </>
  );
};
