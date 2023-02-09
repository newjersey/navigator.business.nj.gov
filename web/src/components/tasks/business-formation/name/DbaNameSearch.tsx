import { Content } from "@/components/Content";
import { DbaAvailable } from "@/components/tasks/business-formation/name/DbaAvailable";
import { DbaUnavailable } from "@/components/tasks/business-formation/name/DbaUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/index";
import { ReactElement, useContext } from "react";

export const DbaNameSearch = (): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();
  const { setBusinessNameAvailability } = useContext(BusinessFormationContext);

  useMountEffect(() => {
    analytics.event.business_formation_dba_name_search_field.appears.dba_name_search_field_appears();
  });

  const onSubmit = async (submittedName: string, nameAvailability: NameAvailability): Promise<void> => {
    if (!nameAvailability || !userData) {
      return;
    }
    setBusinessNameAvailability(nameAvailability);
    if (nameAvailability.status === "AVAILABLE") {
      await update({
        ...userData,
        profileData: {
          ...userData.profileData,
          nexusDbaName: submittedName,
        },
      });
    }
  };

  return (
    <>
      <Content>{`${Config.nexusNameSearch.dbaNameHeader}\n\n${Config.nexusNameSearch.dbaNameDescription}`}</Content>
      <SearchBusinessNameForm
        unavailable={DbaUnavailable}
        available={DbaAvailable}
        onChange={setBusinessNameAvailability}
        isBusinessFormation
        isDba
        config={{
          searchButtonText: Config.nexusNameSearch.dbaNameSearchSubmitButton,
          searchButtonTestId: "search-dba-availability",
          inputPlaceholderText: Config.nexusNameSearch.dbaNameSearchPlaceholder,
          inputLabel: Config.nexusNameSearch.dbaNameSearchLabel,
        }}
        onSubmit={onSubmit}
      />
    </>
  );
};
