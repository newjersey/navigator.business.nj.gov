import { Content } from "@/components/Content";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useContext } from "react";

export const ReviewProvisions = () => {
  const { state } = useContext(BusinessFormationContext);

  return (
    <>
      <ReviewSectionHeader
        header={Config.businessFormationDefaults.reviewStepProvisionsHeader}
        stepName="Business"
        testId="provisions"
      />
      <div className="" data-testid="provisions">
        {state.formationFormData.provisions.map((provision, index) => {
          return (
            <div className="margin-bottom-2" key={index}>
              <div className="text-bold margin-bottom-05">
                {index + 1}. {Config.businessFormationDefaults.reviewStepProvisionsSubheader}
              </div>
              <Content>{provision}</Content>
            </div>
          );
        })}
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
