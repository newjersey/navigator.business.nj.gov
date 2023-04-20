import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { corpLegalStructures, FormationLegalType } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

export const ReviewMembers = (): ReactElement => {
  const { Config } = useConfig();
  const { userData } = useUserData();

  const isCorp = userData?.profileData.legalStructureId
    ? corpLegalStructures.includes(userData?.profileData.legalStructureId as FormationLegalType)
    : false;
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  const getConfig = (): { header: string; label: string } => {
    const field = isCorp ? "directors" : "members";
    return {
      header: Config.formation.fields[field].label,
      label: Config.formation.sections.review.nameLabel,
    };
  };

  return (
    <ReviewSubSection header={getConfig().header}>
      {userData?.formationData.formationFormData.members?.map((member, index) => {
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
                  value={member.addressLine1 || italicNotEnteredText}
                />
                {member.addressLine2 && (
                  <ReviewLineItem
                    label={Config.formation.addressModal.addressLine2.label}
                    value={member.addressLine2 || italicNotEnteredText}
                  />
                )}
                <ReviewLineItem
                  label={Config.formation.addressModal.addressCity.label}
                  value={member.addressCity || italicNotEnteredText}
                />
                <ReviewLineItem
                  label={Config.formation.addressModal.addressState.label}
                  value={member.addressState?.name ?? italicNotEnteredText}
                />
                <ReviewLineItem
                  label={Config.formation.addressModal.addressZipCode.label}
                  value={member.addressZipCode || italicNotEnteredText}
                />
              </>
            )}
          </div>
        );
      })}
    </ReviewSubSection>
  );
};
