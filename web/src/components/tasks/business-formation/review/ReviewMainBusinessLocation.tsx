import { ReviewLineItem } from "@/components/tasks/business-formation/review/ReviewLineItem";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getStringifiedAddress } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { state } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  const getAddressDisplay = (): string => {
    return getStringifiedAddress(
      state.formationFormData.addressLine1 || italicNotEnteredText,
      userData?.profileData.municipality?.displayName || italicNotEnteredText,
      state.formationFormData.addressState?.name || italicNotEnteredText,
      state.formationFormData.addressZipCode || italicNotEnteredText,
      state.formationFormData.addressLine2
    );
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
