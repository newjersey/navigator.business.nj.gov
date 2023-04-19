import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ReviewSignatures = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;
  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);

  const getConfig = (): { header: string; label: string } => {
    const field = isCorp ? "incorporators" : "signers";
    return {
      header: Config.formation.fields[field].label,
      label: Config.formation.sections.review.nameLabel,
    };
  };

  return (
    <ReviewSubSection header={getConfig().header}>
      {state.formationFormData.signers?.length === 0 && <i>{Config.formation.general.notEntered}</i>}
      {state.formationFormData.signers?.map((signer, index) => {
        return (
          <div
            data-testid="review-signers"
            key={`${signer}-${index}`}
            className={index === 0 ? "" : "margin-top-2"}
          >
            <ReviewLineItem
              label={getConfig().label}
              value={signer.name ?? italicNotEnteredText}
              marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
            />
            {state.formationFormData.businessLocationType !== "NJ" && (
              <ReviewLineItem
                label={Config.formation.fields.signers.titleLabel}
                value={signer.title ?? italicNotEnteredText}
                marginOverride={"margin-top-0"}
              />
            )}
          </div>
        );
      })}
      {state.formationFormData.incorporators?.map((signer, index) => {
        return (
          <div key={`${signer}-${index}`} className={index === 0 ? "" : "margin-top-2"}>
            <ReviewLineItem
              label={getConfig().label}
              value={signer.name ?? italicNotEnteredText}
              marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
            />
            <ReviewLineItem
              label={Config.formation.addressModal.addressLine1.label}
              value={signer.addressLine1 || italicNotEnteredText}
            />
            {signer.addressLine2 && (
              <ReviewLineItem
                label={Config.formation.addressModal.addressLine2.label}
                value={signer.addressLine2 || italicNotEnteredText}
              />
            )}
            <ReviewLineItem
              label={Config.formation.addressModal.addressCity.label}
              value={signer.addressCity || italicNotEnteredText}
            />
            <ReviewLineItem
              label={Config.formation.addressModal.addressState.label}
              value={signer.addressState?.name ?? italicNotEnteredText}
            />
            <ReviewLineItem
              label={Config.formation.addressModal.addressZipCode.label}
              value={signer.addressZipCode || italicNotEnteredText}
            />
          </div>
        );
      })}
    </ReviewSubSection>
  );
};
