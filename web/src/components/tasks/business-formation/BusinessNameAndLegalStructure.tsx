import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";
import { businessFormationTabs } from "./businessFormationTabs";

interface Props {
  reviewPage?: boolean;
}

export const BusinessNameAndLegalStructure = ({ reviewPage = false }: Props): ReactElement => {
  const { state, setTab } = useContext(FormationContext);
  const { userData } = useUserData();
  const router = useRouter();
  const onEditProfile = () => router.push("/profile");

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  let legalStructureName;
  const legalStructure = LookupLegalStructureById(userData?.profileData.legalStructureId);
  legalStructure.name === "Limited Liability Company (LLC)"
    ? (legalStructureName = BusinessFormationDefaults.llcText)
    : (legalStructureName = legalStructure.name);

  if (!userData) return <></>;

  return (
    <>
      <div className="flex space-between margin-bottom-2 flex-align-center">
        <div className="maxw-mobile-lg ">
          <Content overrides={{ h3: headerLevelTwo }}>
            {state.displayContent.businessNameAndLegalStructure.contentMd}
          </Content>
        </div>
        <div className="margin-left-2">
          {reviewPage && (
            <Button
              style="tertiary"
              onClick={() => {
                setTab(businessFormationTabs.findIndex((obj) => obj.section === "Main Business"));
                scrollToTop();
              }}
              underline
              dataTestid="edit-business-name-section"
            >
              {BusinessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
      </div>

      <div className="min-height-575rem bg-base-lightest margin-bottom-205 display-block tablet:display-flex tablet:flex-row ">
        <div className="padding-205 flex-half">
          <Content>{state.displayContent.reviewPageBusinessName.contentMd}</Content>
          <span className="text-accent-cool-darker">
            {userData?.profileData.businessName || BusinessFormationDefaults.notSetBusinessNameText}
          </span>{" "}
          {!reviewPage && (
            <Button
              style="tertiary"
              widthAutoOnMobile
              onClick={onEditProfile}
              underline
              dataTestid="edit-business-name"
            >
              {BusinessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
        <div className="padding-bottom-205 padding-x-205 tablet:padding-205 flex-half">
          <Content>{state.displayContent.reviewPageLegalStructure.contentMd}</Content>
          <span>{legalStructureName}</span>{" "}
          {!reviewPage && (
            <Button
              style="tertiary"
              widthAutoOnMobile
              onClick={onEditProfile}
              underline
              dataTestid="edit-legal-structure"
            >
              {BusinessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
