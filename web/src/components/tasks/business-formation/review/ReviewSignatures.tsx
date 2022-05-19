import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useContext } from "react";
import { LookupBusinessFormationTabByName } from "../BusinessFormationTabsConfiguration";

export const ReviewSignatures = (): ReactElement => {
  const { state, setTab } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageSignaturesHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(LookupBusinessFormationTabByName("Contacts"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-signature-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="display-block tablet:display-flex">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageSignerNameLabel}</Content>
        </div>
        <div>{state.formationFormData.signer.name}</div>
      </div>
      {userData?.formationData.formationFormData.additionalSigners.map((signer, index) => (
        <div className="display-block tablet:display-flex" key={`${signer}-${index}`}>
          <div className="text-bold width-11rem margin-top-1">
            <Content>{Config.businessFormationDefaults.reviewPageSignerNameLabel}</Content>
          </div>
          <div className="tablet:margin-top-1">{signer.name}</div>
        </div>
      ))}
    </>
  );
};
