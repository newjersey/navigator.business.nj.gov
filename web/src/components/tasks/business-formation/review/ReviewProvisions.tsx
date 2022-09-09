import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { LookupStepIndexByName } from "@/components/tasks/business-formation/BusinessFormationStepsConfiguration";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useContext } from "react";

export const ReviewProvisions = () => {
  const { state, setStepIndex } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewStepProvisionsHeader}
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
            dataTestid="edit-provisions"
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="" data-testid="provisions">
        {state.formationFormData.provisions.map((provision, index) => (
          <div className="margin-bottom-2" key={index}>
            <div className="text-bold margin-bottom-05">
              {index + 1}. {Config.businessFormationDefaults.reviewStepProvisionsSubheader}
            </div>
            <Content>{provision}</Content>
          </div>
        ))}
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
