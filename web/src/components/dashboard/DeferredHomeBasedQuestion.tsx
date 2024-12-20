import { DeferredOnboardingQuestion } from "@/components/DeferredOnboardingQuestion";
import { HomeBasedBusiness } from "@/components/data-fields/HomeBasedBusiness";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { Business, LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

interface Props {
  business: Business | undefined;
  onSave: () => void;
}
export const DeferredHomeBasedQuestion = (props: Props): ReactElement<any> => {
  if (!props.business) return <></>;
  const operatingPhase = LookupOperatingPhaseById(props.business.profileData.operatingPhase);

  return (
    <div className="margin-bottom-4">
      <DeferredOnboardingQuestion
        label={
          <FieldLabelDescriptionOnly
            fieldName="homeBasedBusiness"
            isAltDescriptionDisplayed={operatingPhase.displayAltHomeBasedBusinessDescription}
          />
        }
        onSave={props.onSave}
      >
        <HomeBasedBusiness />
      </DeferredOnboardingQuestion>
    </div>
  );
};
