import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { corpLegalStructures } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ReviewMembers = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);
  const hasMembers = (state.formationFormData.members?.length ?? 0) > 0;
  const isNonProfit = state.formationFormData.legalType === "nonprofit";

  const getConfig = (): { header: string; label: string } => {
    const field = isCorp ? "directors" : "members";
    return {
      header: isNonProfit ? Config.formation.fields.trustees.label : Config.formation.fields[field].label,
      label: isNonProfit
        ? Config.formation.fields.trustees.trusteeFullName
        : Config.formation.sections.review.nameLabel,
    };
  };

  const displayMembers = (): ReactElement<any> => {
    return (
      <>
        {state.formationFormData.members?.map((member, index) => {
          return (
            <div key={`${member.name}-${index}`}>
              <ReviewLineItem
                label={getConfig().label}
                value={member.name}
                marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
              />
              {isCorp && (
                <>
                  <ReviewLineItem
                    label={Config.formation.addressModal.addressLine1.label}
                    value={member.addressLine1}
                  />
                  {member.addressLine2 && (
                    <ReviewLineItem
                      label={Config.formation.addressModal.addressLine2.label}
                      value={member.addressLine2}
                    />
                  )}
                  <ReviewLineItem
                    label={Config.formation.addressModal.addressCity.label}
                    value={member.addressCity}
                  />
                  <ReviewLineItem
                    label={Config.formation.addressModal.addressState.label}
                    value={member.addressState?.name}
                  />
                  <ReviewLineItem
                    label={Config.formation.addressModal.addressZipCode.label}
                    value={member.addressZipCode}
                  />
                </>
              )}
            </div>
          );
        })}
      </>
    );
  };

  const displayEmptyMembers = (): ReactElement<any> => {
    return (
      <div data-testid="empty-members-section">
        <ReviewLineItem label={getConfig().label} value={undefined} marginOverride={"margin-top-0"} />
        {isCorp && (
          <>
            <ReviewLineItem label={Config.formation.addressModal.addressLine1.label} value={undefined} />
            <ReviewLineItem label={Config.formation.addressModal.addressCity.label} value={undefined} />
            <ReviewLineItem label={Config.formation.addressModal.addressState.label} value={undefined} />
            <ReviewLineItem label={Config.formation.addressModal.addressZipCode.label} value={undefined} />
          </>
        )}
      </div>
    );
  };

  const members = (): ReactElement<any> => {
    if (hasMembers) {
      return displayMembers();
    } else {
      return displayEmptyMembers();
    }
  };

  return (
    <ReviewSubSection testId={"review-members"} header={getConfig().header}>
      {members()}
    </ReviewSubSection>
  );
};
