import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useContext } from "react";
import { LookupBusinessFormationTabByName } from "../BusinessFormationTabsConfiguration";

export const ReviewProvisions = () => {
  const { state, setTab } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>
            {Config.businessFormationDefaults.reviewPageProvisionsHeader}
          </Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              setTab(LookupBusinessFormationTabByName("Business"));
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
          <div className="grid-row margin-bottom-2" key={index}>
            <div className="tablet:grid-col-4 text-bold">
              {index + 1}. {Config.businessFormationDefaults.reviewPageProvisionsSubheader}
            </div>
            <div className="tablet:grid-col-8">{provision}</div>
          </div>
        ))}
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
