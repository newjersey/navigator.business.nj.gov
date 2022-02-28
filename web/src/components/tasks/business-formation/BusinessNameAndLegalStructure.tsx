import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/";
import { FormHelperText } from "@mui/material";
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
  const onEditProfile = () => router.push("/profile?path=businessFormation");

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  let legalStructureName;
  const legalStructure = LookupLegalStructureById(userData?.profileData.legalStructureId);
  legalStructure.name === "Limited Liability Company (LLC)"
    ? (legalStructureName = Config.businessFormationDefaults.llcText)
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
                setTab(businessFormationTabs.findIndex((obj) => obj.section === "Business"));
                scrollToTop();
              }}
              underline
              dataTestid="edit-business-name-section"
            >
              {Config.businessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
      </div>

      <div
        className={`min-height-575rem bg-base-lightest margin-bottom-1 display-block tablet:display-flex tablet:flex-row ${
          state.errorMap["businessName"].invalid && "radius-md border-1px border-error"
        }`}
      >
        <div className="padding-205 flex-half">
          <Content>{Config.businessFormationDefaults.reviewPageBusinessNameLabel}</Content>
          <span className="text-accent-cool-darker">
            {state?.formationFormData.businessName || Config.businessFormationDefaults.notSetBusinessNameText}
          </span>{" "}
          {!reviewPage && (
            <Button
              style="tertiary"
              widthAutoOnMobile
              onClick={() => {
                analytics.event.business_formation_business_name_edit.click.go_to_profile_screen();
                onEditProfile();
              }}
              underline
              dataTestid="edit-business-name"
            >
              {Config.businessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
        <div
          className="padding-bottom-205 padding-x-205 tablet:padding-205 flex-half"
          data-testid="legal-structure"
        >
          <Content>{Config.businessFormationDefaults.reviewPageLegalStructureLabel}</Content>
          <span>{legalStructureName}</span>{" "}
          {!reviewPage && (
            <Button
              style="tertiary"
              widthAutoOnMobile
              onClick={() => {
                analytics.event.business_formation_legal_structure_edit.click.go_to_profile_screen();
                onEditProfile();
              }}
              underline
              dataTestid="edit-legal-structure"
            >
              {Config.businessFormationDefaults.editButtonText}
            </Button>
          )}
        </div>
      </div>
      <FormHelperText id={"businessNameAndLegalStructure"} className="Mui-error">
        {state.errorMap["businessName"].invalid &&
          Config.businessFormationDefaults.notSetBusinessNameErrorText}
      </FormHelperText>
    </>
  );
};
