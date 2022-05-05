import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { businessFormationTabs } from "@/components/tasks/business-formation/businessFormationTabs";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";

export const ReviewMembers = (): ReactElement => {
  const { setTab } = useContext(FormationContext);
  const { userData } = useUserData();

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageMembersHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(businessFormationTabs.findIndex((obj) => obj.section === "Contacts"));
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
        <div className="display-block tablet:display-flex" key={`${member.name}-${index}`}>
          <div className={`text-bold width-11rem ${index !== 0 ? "margin-top-1" : ""}`}>
            <Content>{Config.businessFormationDefaults.reviewPageMemberNameLabel}</Content>
          </div>
          <div className={index !== 0 ? "tablet:margin-top-1" : ""}>{member.name}</div>
        </div>
      ))}
      <hr className="margin-y-205" />
    </>
  );
};
