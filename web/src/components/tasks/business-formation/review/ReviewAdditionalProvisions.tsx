import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewSubSection } from "@/components/tasks/business-formation/review/section/ReviewSubSection";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewAdditionalProvisions = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <ReviewSubSection header={Config.formation.fields.additionalProvisions.label}>
      <div className="" data-testid="provisions">
        {state.formationFormData.additionalProvisions?.map((provision, index) => {
          return (
            <div className="margin-bottom-2" key={index}>
              <div className="text-bold margin-bottom-05">
                {index + 1}. {Config.formation.fields.additionalProvisions.secondaryLabel}
              </div>
              <ExpandCollapseString
                text={provision}
                viewMoreText={Config.formation.general.viewMoreButtonText}
                viewLessText={Config.formation.general.viewLessButtonText}
                lines={2}
              />
            </div>
          );
        })}
      </div>
    </ReviewSubSection>
  );
};
