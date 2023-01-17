import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ReviewSignatures = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;
  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);

  const getHeader = () => {
    if (isCorp) {
      return Config.businessFormationDefaults.reviewStepIncorporatorsHeader;
    } else if (state.formationFormData.legalType == "limited-partnership") {
      return Config.businessFormationDefaults.reviewStepSignaturesHeader;
    } else {
      return Config.businessFormationDefaults.reviewStepSignaturesHeader;
    }
  };

  return (
    <>
      <ReviewSectionHeader header={getHeader()} stepName="Contacts" testId="signature" />
      {state.formationFormData.signers?.length === 0 && (
        <i>{Config.businessFormationDefaults.reviewStepNotEnteredText}</i>
      )}
      {state.formationFormData.signers?.map((signer, index) => {
        return (
          <div key={`${signer}-${index}`} className={index === 0 ? "" : "margin-top-2"}>
            <ReviewLineItem
              label={
                isCorp
                  ? Config.businessFormationDefaults.reviewStepIncorporatorNameLabel
                  : Config.businessFormationDefaults.reviewStepSignerNameLabel
              }
              value={
                `${signer.name}${
                  state.formationFormData.businessLocationType == "NJ" ? "" : ` - ${signer.title}`
                }` || italicNotEnteredText
              }
              marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
            />
          </div>
        );
      })}
      {state.formationFormData.incorporators?.map((signer, index) => {
        return (
          <div key={`${signer}-${index}`} className={index === 0 ? "" : "margin-top-2"}>
            <ReviewLineItem
              label={Config.businessFormationDefaults.reviewStepIncorporatorAddressLabel}
              value={getStringifiedAddress({
                addressLine1: signer.addressLine1,
                city: signer.addressCity ?? "",
                state: signer.addressState?.name ?? "",
                zipcode: signer.addressZipCode,
                addressLine2: signer.addressLine2,
              })}
            />
          </div>
        );
      })}

      <hr className="margin-y-205" />
    </>
  );
};
