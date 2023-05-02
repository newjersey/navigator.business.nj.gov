import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { arrayOfCountriesObjects } from "@businessnjgovnavigator/shared/countries";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const businessLocationType = state.formationFormData.businessLocationType;

  const getAddressCity = (): string | undefined => {
    return businessLocationType === "NJ"
      ? state.formationFormData.addressMunicipality?.displayName
      : state.formationFormData.addressCity;
  };

  const getAddressState = (): string | undefined => {
    return businessLocationType === "INTL"
      ? state.formationFormData.addressProvince
      : state.formationFormData.addressState?.name;
  };

  const getAddressCountry = (): string | undefined => {
    return businessLocationType === "INTL"
      ? arrayOfCountriesObjects.find(
          (country) => country.shortCode === state.formationFormData.addressCountry
        )?.name
      : undefined;
  };

  return (
    <ReviewSubSection header={Config.formation.sections.addressHeader} marginOverride="margin-top-0">
      <ReviewLineItem
        label={Config.formation.fields.addressLine1.label}
        value={state.formationFormData.addressLine1}
      />
      {state.formationFormData.addressLine2 && (
        <ReviewLineItem
          label={Config.formation.fields.addressLine2.label}
          value={state.formationFormData.addressLine2}
          dataTestId={"business-address-line-two"}
        />
      )}
      <ReviewLineItem label={Config.formation.fields.addressCity.label} value={getAddressCity()} />
      <ReviewLineItem label={Config.formation.fields.addressState.label} value={getAddressState()} />
      <ReviewLineItem
        label={Config.formation.fields.addressZipCode.label}
        value={state.formationFormData.addressZipCode}
      />
      {businessLocationType === "INTL" && (
        <ReviewLineItem label={Config.formation.fields.addressCountry.label} value={getAddressCountry()} />
      )}
    </ReviewSubSection>
  );
};
