import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getStringifiedAddress } from "@/lib/utils/formatters";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  const getAddressDisplay = (): string => {
    return getStringifiedAddress({
      addressLine1: state.formationFormData.addressLine1 || italicNotEnteredText,
      city: userData?.profileData.municipality?.displayName || italicNotEnteredText,
      state: state.formationFormData.addressState?.name || italicNotEnteredText,
      zipcode: state.formationFormData.addressZipCode || italicNotEnteredText,
      addressLine2: state.formationFormData.addressLine2,
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
