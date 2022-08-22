import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupTabIndexByName } from "@/components/tasks/business-formation/BusinessFormationTabs";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ReviewSignatures = (): ReactElement => {
  const { state, setTab } = useContext(BusinessFormationContext);

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  const isCorp = corpLegalStructures.includes(state.legalStructureId);

  const getHeader = () => {
    if (isCorp) {
      return Config.businessFormationDefaults.reviewPageIncorporatorsHeader;
    } else if (state.legalStructureId == "limited-partnership") {
      return Config.businessFormationDefaults.reviewPageSignaturesHeader;
    } else return Config.businessFormationDefaults.reviewPageSignaturesHeader;
  };

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>{getHeader()}</Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(LookupTabIndexByName("Contacts"));
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
          {(isCorp || state.legalStructureId == "limited-partnership") && (
            <>
              <div className="display-block tablet:display-flex margin-top-1">
                <div className="text-bold width-11rem">
                  <Content>{Config.businessFormationDefaults.reviewPageIncorporatorAddressLabel}</Content>
                </div>
                <div>
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
