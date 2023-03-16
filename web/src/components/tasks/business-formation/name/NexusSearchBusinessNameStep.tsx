import { Content } from "@/components/Content";
import { NexusAvailable } from "@/components/tasks/business-formation/name/NexusAvailable";
import { NexusUnavailable } from "@/components/tasks/business-formation/name/NexusUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability } from "@businessnjgovnavigator/shared/";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useContext } from "react";

export const NexusSearchBusinessNameStep = (): ReactElement => {
  const { state, setFormationFormData, setFieldsInteracted } = useContext(BusinessFormationContext);
  const { userData, update } = useUserData();
  const { Config } = useConfig();
  const FIELD_NAME = "businessName";

  const setBusinessNameAvailability = (nameAvailability: NameAvailability | undefined): void => {
    setFormationFormData({
      ...state.formationFormData,
      businessNameAvailability: nameAvailability ?? { status: undefined, similarNames: [] },
    });
  };

  const onSubmit = async (
    submittedName: string,
    nameAvailability: NameAvailability,
    isInitialSubmit: boolean
  ): Promise<void> => {
    if (!nameAvailability || !userData || isInitialSubmit) {
      return;
    }
    setFieldsInteracted([FIELD_NAME]);
    let newUserData: UserData | undefined;
    if (nameAvailability.status === "AVAILABLE") {
      newUserData = {
        ...userData,
        formationData: {
          ...userData.formationData,
          formationFormData: {
            ...userData.formationData.formationFormData,
            businessName: submittedName,
            businessNameAvailability: nameAvailability,
          },
        },
        profileData: {
          ...userData.profileData,
          businessName: submittedName,
          nexusDbaName: emptyProfileData.nexusDbaName,
          needsNexusDbaName: emptyProfileData.needsNexusDbaName,
        },
      };
    } else if (nameAvailability.status === "UNAVAILABLE") {
      newUserData = {
        ...userData,
        formationData: {
          ...userData.formationData,
          formationFormData: {
            ...userData.formationData.formationFormData,
            businessName: submittedName,
            businessNameAvailability: nameAvailability,
          },
        },
        profileData: {
          ...userData.profileData,
          businessName: submittedName,
          needsNexusDbaName: true,
        },
      };
    }

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        businessName: submittedName,
      };
    });

    if (newUserData) {
      return update(newUserData);
    }
    return;
  };

  return (
    <div data-testid={"nexus-name-step"}>
      <h3>{Config.formation.fields.businessName.overrides.foreign.header}</h3>
      <Content>{Config.formation.fields.businessName.overrides.foreign.description}</Content>
      <SearchBusinessNameForm
        unavailable={NexusUnavailable}
        available={NexusAvailable}
        hideTextFieldWhenUnavailable={true}
        onSubmit={onSubmit}
        isBusinessFormation={true}
        onChange={setBusinessNameAvailability}
        className="grid-col-12"
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "search-availability",
        }}
      />
    </div>
  );
};
