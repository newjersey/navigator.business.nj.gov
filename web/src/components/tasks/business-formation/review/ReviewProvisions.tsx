import { ExpandCollapseString } from "@/components/ExpandCollapseString";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const ReviewProvisions = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <>
      <ReviewSectionHeader
        header={Config.formation.fields.provisions.label}
        stepName="Business"
        testId="provisions"
      />
      <div className="" data-testid="provisions">
        {state.formationFormData.provisions?.map((provision, index) => {
          return (
            <div className="margin-bottom-2" key={index}>
              <div className="text-bold margin-bottom-05">
                {index + 1}. {Config.formation.fields.provisions.secondaryLabel}
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
      <hr className="margin-y-205" />
    </>
  );
};
