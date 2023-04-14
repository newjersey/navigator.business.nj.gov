import { ReviewLineItem } from "@/components/tasks/business-formation/review/section/ReviewLineItem";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import { arrayOfCountriesObjects } from "@businessnjgovnavigator/shared/countries";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  const italicNotEnteredText = `*${Config.formation.general.notEntered}*`;

  const getAddressDisplay = (): string => {
    const businessLocationType = state.formationFormData.businessLocationType;
    return getStringifiedAddress({
      addressLine1: state.formationFormData.addressLine1 || italicNotEnteredText,
      city:
        (businessLocationType === "NJ"
          ? state.formationFormData.addressMunicipality?.displayName
          : state.formationFormData.addressCity) || italicNotEnteredText,
      state:
        (businessLocationType === "INTL"
          ? state.formationFormData.addressProvince
          : state.formationFormData.addressState?.name) || italicNotEnteredText,
      zipcode: state.formationFormData.addressZipCode || italicNotEnteredText,
      addressLine2: state.formationFormData.addressLine2,
      country:
        businessLocationType === "INTL"
          ? arrayOfCountriesObjects.find(
              (country) => country.shortCode === state.formationFormData.addressCountry
            )?.name ?? italicNotEnteredText
          : undefined,
    });
  };

  return (
    <ReviewSubSection header={Config.formation.sections.review.locationHeader} marginOverride="margin-top-0">
      <ReviewLineItem label={Config.formation.sections.review.addressLabel} value={getAddressDisplay()} />
    </ReviewSubSection>
  );
};
