import { Content } from "@/components/Content";
import { DbaAvailable } from "@/components/tasks/search-business-name/DbaAvailable";
import { DbaUnavailable } from "@/components/tasks/search-business-name/DbaUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability } from "@/lib/types/types";
import { ReactElement } from "react";

export const DbaNameSearch = (): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();

  const onSubmit = async (submittedName: string, nameAvailability: NameAvailability): Promise<void> => {
    if (!nameAvailability || !userData) {
      return;
    }
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
        isDba={true}
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
