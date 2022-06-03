import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";
import { LookupBusinessFormationTabByName } from "../BusinessFormationTabsConfiguration";

export const ReviewSignatures = (): ReactElement => {
  const { state, setTab } = useContext(BusinessFormationContext);

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  const isCorp = corpLegalStructures.includes(state.legalStructureId);

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {isCorp
              ? Config.businessFormationDefaults.reviewPageIncorporatorsHeader
              : Config.businessFormationDefaults.reviewPageSignaturesHeader}
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
      {state.formationFormData.signers.map((signer, index) => (
        <div key={`${signer}-${index}`} className={index !== 0 ? "margin-top-2" : ""}>
          <div className="display-block tablet:display-flex">
            <div className="text-bold width-11rem">
              <Content>
                {isCorp
                  ? Config.businessFormationDefaults.reviewPageIncorporatorNameLabel
                  : Config.businessFormationDefaults.reviewPageSignerNameLabel}
              </Content>
            </div>
            <div>{signer.name}</div>
          </div>
          {isCorp && (
            <>
              <div className="display-block tablet:display-flex">
                <div className="text-bold width-11rem margin-top-1">
                  <Content>{Config.businessFormationDefaults.reviewPageIncorporatorAddressLabel}</Content>
                </div>
                <div className="tablet:margin-top-1">
                  {getStringifiedAddress(
                    signer.addressLine1,
                    signer.addressCity,
                    signer.addressState,
                    signer.addressZipCode,
                    signer.addressLine2
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      ))}
    </>
  );
};
