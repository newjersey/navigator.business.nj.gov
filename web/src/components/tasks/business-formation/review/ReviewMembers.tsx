import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSection } from "@/components/tasks/business-formation/review/section/ReviewSection";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import { corpLegalStructures, FormationLegalType } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

export const ReviewMembers = (): ReactElement => {
  const { Config } = useConfig();
  const { userData } = useUserData();

  const isCorp = userData?.profileData.legalStructureId
    ? corpLegalStructures.includes(userData?.profileData.legalStructureId as FormationLegalType)
    : false;

  const getConfig = (): { header: string; label: string } => {
    const field = isCorp ? "directors" : "members";
    return {
      header: Config.formation.fields[field].label,
      label: Config.formation.sections.review.nameLabel,
    };
  };

  return (
    <ReviewSection
      buttonText={Config.formation.general.editButtonText}
      header={getConfig().header}
      stepName="Contacts"
      testId="edit-members-step"
    >
      {userData?.formationData.formationFormData.members?.map((member, index) => {
        return (
          <div key={`${member.name}-${index}`}>
            <ReviewLineItem
              label={getConfig().label}
              value={member.name}
              marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
            />
            {isCorp && (
              <ReviewLineItem
                label={Config.formation.sections.review.addressLabel}
                value={getStringifiedAddress({
                  addressLine1: member.addressLine1,
                  city: member.addressCity ?? "",
                  state: member.addressState?.name ?? "",
                  zipcode: member.addressZipCode,
                  addressLine2: member.addressLine2,
                })}
              />
            )}
          </div>
        );
      })}
    </ReviewSection>
  );
};
