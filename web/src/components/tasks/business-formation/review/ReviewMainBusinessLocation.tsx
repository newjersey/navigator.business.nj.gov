import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { arrayOfCountriesObjects } from "@businessnjgovnavigator/shared/countries";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);

  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  const getAddressDisplay = (): string => {
    const businessLocationType = state.formationFormData.businessLocationType;
    return getStringifiedAddress({
      addressLine1: state.formationFormData.addressLine1 || italicNotEnteredText,
      city:
        (businessLocationType == "NJ"
          ? state.formationFormData.addressMunicipality?.displayName
          : state.formationFormData.addressCity) || italicNotEnteredText,
      state:
        (businessLocationType == "INTL"
          ? state.formationFormData.addressProvince
          : state.formationFormData.addressState?.name) || italicNotEnteredText,
      zipcode: state.formationFormData.addressZipCode || italicNotEnteredText,
      addressLine2: state.formationFormData.addressLine2,
      country:
        businessLocationType == "INTL"
          ? arrayOfCountriesObjects.find(
              (country) => country.shortCode == state.formationFormData.addressCountry
            )?.name ?? italicNotEnteredText
          : undefined,
    });
  };

  return (
    <>
      <ReviewSectionHeader
        header={Config.businessFormationDefaults.reviewStepLocationHeader}
        stepName="Business"
        testId="location"
      />
      <ReviewLineItem
        label={Config.businessFormationDefaults.reviewStepAddressLabel}
        value={getAddressDisplay()}
      />
      <hr className="margin-y-205" />
    </>
  );
};
