import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
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
      header: Config.formation.fields[field].reviewStepHeader,
      label: Config.formation.fields[field].reviewStepNameLabel,
    };
  };

  return (
    <>
      <ReviewSectionHeader header={getConfig().header} stepName="Contacts" testId="members" />
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
                  city: member.foreignAddressCity ?? "",
                  state: member.addressState?.name ?? "",
                  zipcode: member.addressZipCode,
                  addressLine2: member.addressLine2,
                })}
              />
            )}
          </div>
        );
      })}
      <hr className="margin-y-205" />
    </>
  );
};
