import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ReviewSignatures = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;
  const isCorp = corpLegalStructures.includes(state.legalStructureId);

  const getHeader = () => {
    if (isCorp) {
      return Config.businessFormationDefaults.reviewStepIncorporatorsHeader;
    } else if (state.legalStructureId == "limited-partnership") {
      return Config.businessFormationDefaults.reviewStepSignaturesHeader;
    } else {
      return Config.businessFormationDefaults.reviewStepSignaturesHeader;
    }
  };

  return (
    <>
      <ReviewSectionHeader header={getHeader()} stepName="Contacts" testId="signature" />
      {state.formationFormData.signers.length === 0 && (
        <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i>
      )}
      {state.formationFormData.signers.map((signer, index) => {
        return (
          <div key={`${signer}-${index}`} className={index !== 0 ? "margin-top-2" : ""}>
            <ReviewLineItem
              label={
                isCorp
                  ? Config.businessFormationDefaults.reviewStepIncorporatorNameLabel
                  : Config.businessFormationDefaults.reviewStepSignerNameLabel
              }
              value={signer.name || italicNotEnteredText}
              marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
            />
            {(isCorp || state.legalStructureId == "limited-partnership") && (
              <ReviewLineItem
                label={Config.businessFormationDefaults.reviewStepIncorporatorAddressLabel}
                value={getStringifiedAddress(
                  signer.addressLine1,
                  signer.addressCity,
                  signer.addressState,
                  signer.addressZipCode,
                  signer.addressLine2
                )}
              />
            )}
          </div>
        );
      })}
      <hr className="margin-y-205" />
    </>
  );
};
