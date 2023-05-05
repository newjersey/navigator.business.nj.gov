import { Content } from "@/components/Content";
import { DbaUnavailable } from "@/components/tasks/business-formation/name/DbaUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { NameAvailability } from "@businessnjgovnavigator/shared/";
import { ReactElement, useContext } from "react";

export const DbaNameSearch = (): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();
  const { setDbaBusinessNameAvailability, state } = useContext(BusinessFormationContext);

  useMountEffect(() => {
    analytics.event.business_formation_dba_name_search_field.appears.dba_name_search_field_appears();
  });

  const onSubmit = async (submittedName: string, dbaNameAvailability: NameAvailability): Promise<void> => {
    if (!dbaNameAvailability || !userData) {
      return;
    }
    setDbaBusinessNameAvailability(dbaNameAvailability);
    console.log({dbaNameAvailability})
    console.log({state})
    if (dbaNameAvailability.status === "AVAILABLE") {
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
        config={{
          availableAlertText: Config.nexusNameSearch.dbaAvailableText,
          inputLabel: Config.nexusNameSearch.dbaNameSearchLabel,
          searchButtonTestId: "search-dba-availability",
          searchButtonText: Config.nexusNameSearch.dbaNameSearchSubmitButton,
        }}
        nameAvailability={state.dbaBusinessNameAvailability}
        setNameAvailability={setDbaBusinessNameAvailability}
        businessName={userData?.profileData.nexusDbaName ?? ""}
        isBusinessFormation
        isDba
        onChange={setDbaBusinessNameAvailability}
        onSubmit={onSubmit}
        unavailable={DbaUnavailable}
      />
    </>
  );
};
