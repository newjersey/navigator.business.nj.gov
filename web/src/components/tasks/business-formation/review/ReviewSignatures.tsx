import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { corpLegalStructures } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext } from "react";

export const ReviewSignatures = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const isCorp = corpLegalStructures.includes(state.formationFormData.legalType);
  const hasNoSigners = (state.formationFormData.signers?.length ?? 0) === 0;
  const hasNoIncorporators = (state.formationFormData.incorporators?.length ?? 0) === 0;

  const getConfig = (): { header: string; label: string } => {
    const field = isCorp ? "incorporators" : "signers";
    return {
      header: Config.formation.fields[field].label,
      label: Config.formation.sections.review.nameLabel,
    };
  };

  const displaySigners = (): ReactElement => {
    return (
      <>
        {state.formationFormData.signers?.map((signer, index) => {
          return (
            <div
              data-testid="review-signers"
              key={`${signer}-${index}`}
              className={index === 0 ? "" : "margin-top-2"}
            >
              <ReviewLineItem
                label={getConfig().label}
                value={signer.name}
                marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
              />
              {state.formationFormData.businessLocationType !== "NJ" && (
                <ReviewLineItem
                  label={Config.formation.fields.signers.titleLabel}
                  value={signer.title}
                  marginOverride={"margin-top-0"}
                />
              )}
            </div>
          );
        })}
      </>
    );
  };

  const displayEmptySigners = (): ReactElement => {
    return (
      <div data-testid="review-signers-not-entered" className={"margin-top-2"}>
        <ReviewLineItem label={getConfig().label} value={undefined} marginOverride={"margin-top-0"} />
        {state.formationFormData.businessLocationType !== "NJ" && (
          <ReviewLineItem
            label={Config.formation.fields.signers.titleLabel}
            value={undefined}
            marginOverride={"margin-top-0"}
          />
        )}
      </div>
    );
  };

  const displayIncorporators = (): ReactElement => {
    return (
      <>
        {state.formationFormData.incorporators?.map((signer, index) => {
          return (
            <div key={`${signer}-${index}`} className={index === 0 ? "" : "margin-top-2"}>
              <ReviewLineItem
                label={getConfig().label}
                value={signer.name}
                marginOverride={index === 0 ? "margin-top-0" : "margin-top-2"}
              />
              <ReviewLineItem
                label={Config.formation.addressModal.addressLine1.label}
                value={signer.addressLine1}
              />
              {signer.addressLine2 && (
                <ReviewLineItem
                  label={Config.formation.addressModal.addressLine2.label}
                  value={signer.addressLine2}
                />
              )}
              <ReviewLineItem
                label={Config.formation.addressModal.addressCity.label}
                value={signer.addressCity}
              />
              <ReviewLineItem
                label={Config.formation.addressModal.addressState.label}
                value={signer.addressState?.name}
              />
              <ReviewLineItem
                label={Config.formation.addressModal.addressZipCode.label}
                value={signer.addressZipCode}
              />
            </div>
          );
        })}
      </>
    );
  };

  const displayEmptyIncorporators = (): ReactElement => {
    return (
      <div data-testid="review-incorporators-not-entered" className={"margin-top-2"}>
        <ReviewLineItem label={getConfig().label} value={undefined} marginOverride={"margin-top-0"} />
        {state.formationFormData.businessLocationType !== "NJ" && (
          <ReviewLineItem
            label={Config.formation.fields.signers.titleLabel}
            value={undefined}
            marginOverride={"margin-top-0"}
          />
        )}
      </div>
    );
  };

  const signers = (): ReactElement => {
    if (!isCorp && hasNoSigners) {
      return displayEmptySigners();
    } else {
      return displaySigners();
    }
  };

  const incorporators = (): ReactElement => {
    if (isCorp && hasNoIncorporators) {
      return displayEmptyIncorporators();
    } else {
      return displayIncorporators();
    }
  };

  return (
    <ReviewSubSection header={getConfig().header}>
      {signers()}
      {incorporators()}
    </ReviewSubSection>
  );
};
