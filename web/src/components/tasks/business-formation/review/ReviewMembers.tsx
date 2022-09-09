import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures, FormationLegalType } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const ReviewMembers = (): ReactElement => {
  const { setStepIndex } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const headerLevelTwo = setHeaderRole(2, "h3-styling");
  const isCorp = userData?.profileData.legalStructureId
    ? corpLegalStructures.includes(userData?.profileData.legalStructureId as FormationLegalType)
    : false;

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {isCorp
              ? Config.businessFormationDefaults.reviewStepDirectorsHeader
              : Config.businessFormationDefaults.reviewStepMembersHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setStepIndex(LookupStepIndexByName("Contacts"));
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
        <div key={`${member.name}-${index}`}>
          <div className="display-block tablet:display-flex">
            <div className={`text-bold width-11rem ${index !== 0 ? "margin-top-2" : ""}`}>
              <Content>
                {isCorp
                  ? Config.businessFormationDefaults.reviewStepDirectorNameLabel
                  : Config.businessFormationDefaults.reviewStepMemberNameLabel}
              </Content>
            </div>
            <div className={index !== 0 ? "tablet:margin-top-2" : ""}>{member.name}</div>
          </div>
          {isCorp && (
            <>
              <div className="display-block tablet:display-flex">
                <div className="text-bold width-11rem">
                  <Content>{Config.businessFormationDefaults.reviewStepDirectorAddressLabel}</Content>
                </div>
                <div>
                  {getStringifiedAddress(
                    member.addressLine1,
                    member.addressCity,
                    member.addressState,
                    member.addressZipCode,
                    member.addressLine2
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
      <hr className="margin-y-205" />
    </>
  );
};
