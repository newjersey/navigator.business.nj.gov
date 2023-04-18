import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getStringifiedAddress } from "@/lib/utils/formatters";
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
      header: Config.formation.fields[field].reviewStepHeader,
      label: Config.formation.sections.review.nameLabel,
    };
  };

  return (
    <ReviewSubSection header={getConfig().header}>
      {state.formationFormData.signers?.length === 0 && <i>{Config.formation.general.notEntered}</i>}
      {state.formationFormData.signers?.map((signer, index) => {
        return (
          <div key={`${signer}-${index}`} className={index === 0 ? "" : "margin-top-2"}>
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
              label={Config.formation.sections.review.addressLabel}
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
    </ReviewSubSection>
  );
};
