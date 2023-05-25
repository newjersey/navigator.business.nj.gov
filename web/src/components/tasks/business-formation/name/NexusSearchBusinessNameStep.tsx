import { Content } from "@/components/Content";
import { NexusUnavailable } from "@/components/tasks/business-formation/name/NexusUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const NexusSearchBusinessNameStep = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <div data-testid={"nexus-name-step"}>
      <h3>{Config.formation.fields.businessName.overrides.foreign.header}</h3>
      <Content>{Config.formation.fields.businessName.overrides.foreign.description}</Content>
      <SearchBusinessNameForm
        businessName={state.formationFormData.businessName}
        nameAvailability={state.businessNameAvailability}
        className="grid-col-12"
        config={{
          availableAlertText: Config.nexusNameSearch.availableText,
          searchButtonTestId: "search-availability",
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
        }}
        hideTextFieldWhenUnavailable={true}
        isBusinessFormation={true}
        unavailable={NexusUnavailable}
      />
    </div>
  );
};
