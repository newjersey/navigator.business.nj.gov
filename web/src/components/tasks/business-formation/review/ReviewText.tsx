import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { camelCaseToSnakeCase, scrollToTop, setHeaderRole } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormationTextField } from "@businessnjgovnavigator/shared/formationData";
import { useContext } from "react";
import { LookupBusinessFormationTabByName } from "../BusinessFormationTabsConfiguration";

interface Props {
  header: string;
  fieldName: FormationTextField;
  tab: string;
}
export const ReviewText = (props: Props) => {
  const { state, setTab } = useContext(BusinessFormationContext);
  const headerLevelTwo = setHeaderRole(2, "h3-styling");
  const snakeCaseFieldName = camelCaseToSnakeCase(props.fieldName);
  return (
    <>
      <div className="flex space-between">
        <div className="maxw-mobile-lg margin-bottom-2">
          <Content overrides={{ h3: headerLevelTwo }}>{props.header}</Content>
        </div>
        <div className="margin-left-2">
          <Button
            style="tertiary"
            onClick={() => {
              // setTab(LookupBusinessFormationTabByName("Business"));
              setTab(LookupBusinessFormationTabByName(props.tab));
              scrollToTop();
            }}
            underline
            dataTestid={`edit-${snakeCaseFieldName}`}
          >
            {Config.businessFormationDefaults.editButtonText}
          </Button>
        </div>
      </div>
      <div className="display-block tablet:display-flex" data-testid={snakeCaseFieldName}>
        <div>{state.formationFormData[props.fieldName]}</div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
