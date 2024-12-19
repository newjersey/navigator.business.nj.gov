import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { NexusAvailable } from "@/components/tasks/business-formation/name/NexusAvailable";
import { NexusUnavailable } from "@/components/tasks/business-formation/name/NexusUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const NexusSearchBusinessNameStep = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);

  return (
    <div data-testid={"nexus-name-step"}>
      <Heading level={2} styleVariant="h3">
        {Config.formation.fields.businessName.overrides.foreign.header}
      </Heading>
      <Content>{Config.formation.fields.businessName.overrides.foreign.description}</Content>
      <SearchBusinessNameForm
        unavailable={NexusUnavailable}
        available={NexusAvailable}
        hideTextFieldWhenUnavailable={true}
        isBusinessFormation={true}
        businessName={state.formationFormData.businessName}
        nameAvailability={state.businessNameAvailability}
        className="grid-col-12"
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "search-availability",
        }}
      />
    </div>
  );
};
