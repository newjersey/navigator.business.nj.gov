import { Content } from "@/components/Content";
import { ReviewSectionHeader } from "@/components/tasks/business-formation/review/ReviewSectionHeader";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useContext } from "react";

export const ReviewProvisions = () => {
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
              <Content>{provision}</Content>
            </div>
          );
        })}
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
