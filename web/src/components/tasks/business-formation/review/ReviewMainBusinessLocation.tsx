import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getStringifiedAddress, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext } from "react";

export const ReviewMainBusinessLocation = (): ReactElement => {
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const { userData } = useUserData();

  const headerLevelTwo = setHeaderRole(2, "h3-styling");
  const italicNotEnteredText = `*${Config.businessFormationDefaults.reviewStepNotEnteredText}*`;

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewStepLocationHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setStepIndex(LookupStepIndexByName("Business"));
              scrollToTop();
            }}
            underline
            dataTestid="edit-location-section"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="display-block tablet:display-flex">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewStepAddressLabel}</Content>
        </div>
        <Content>
          {getStringifiedAddress(
            state.formationFormData.businessAddressLine1 || italicNotEnteredText,
            (userData?.profileData.municipality?.name as string) || italicNotEnteredText,
            state.formationFormData.businessAddressState || italicNotEnteredText,
            state.formationFormData.businessAddressZipCode || italicNotEnteredText,
            state.formationFormData.businessAddressLine2
          )}
        </Content>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
