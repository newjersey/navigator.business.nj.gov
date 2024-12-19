import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { DbaAvailable } from "@/components/tasks/business-formation/name/DbaAvailable";
import { DbaUnavailable } from "@/components/tasks/business-formation/name/DbaUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { ReactElement, useContext } from "react";

export const DbaNameSearch = (): ReactElement<any> => {
  const { Config } = useConfig();
  const { state } = useContext(BusinessFormationContext);
  const { business } = useUserData();

  useMountEffect(() => {
    analytics.event.business_formation_dba_name_search_field.appears.dba_name_search_field_appears();
  });

  return (
    <>
      <Heading level={2} styleVariant="h3">
        {Config.nexusNameSearch.dbaNameHeader}
      </Heading>
      <Content>{Config.nexusNameSearch.dbaNameDescription}</Content>
      <SearchBusinessNameForm
        unavailable={DbaUnavailable}
        available={DbaAvailable}
        isBusinessFormation
        isDba
        businessName={business?.profileData.nexusDbaName ?? ""}
        nameAvailability={state.dbaBusinessNameAvailability}
        config={{
          searchButtonText: Config.nexusNameSearch.dbaNameSearchSubmitButton,
          searchButtonTestId: "search-dba-availability",
          inputLabel: Config.nexusNameSearch.dbaNameSearchLabel,
        }}
      />
    </>
  );
};
