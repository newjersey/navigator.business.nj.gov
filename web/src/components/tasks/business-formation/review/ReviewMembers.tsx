import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures, FormationLegalType } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

export const ReviewMembers = (): ReactElement => {
  const { userData } = useUserData();

  const isCorp = userData?.profileData.legalStructureId
    ? corpLegalStructures.includes(userData?.profileData.legalStructureId as FormationLegalType)
    : false;

  return (
    <>
      <ReviewSectionHeader
        header={
          isCorp
            ? Config.businessFormationDefaults.reviewStepDirectorsHeader
            : Config.businessFormationDefaults.reviewStepMembersHeader
        }
        stepName="Contacts"
        testId="members"
      />
      {userData?.formationData.formationFormData.members?.map((member, index) => {
        return (
          <div key={`${member.name}-${index}`}>
            <ReviewLineItem
              label={
                isCorp
                  ? Config.businessFormationDefaults.reviewStepDirectorNameLabel
                  : Config.businessFormationDefaults.reviewStepMemberNameLabel
              }
              value={member.name}
              marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
            />
            {isCorp && (
              <ReviewLineItem
                label={Config.businessFormationDefaults.reviewStepDirectorAddressLabel}
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
      <hr className="margin-y-205" />
    </>
  );
};
