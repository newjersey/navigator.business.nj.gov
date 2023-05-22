import { Content } from "@/components/Content";
import { NexusAvailable } from "@/components/tasks/business-formation/name/NexusAvailable";
import { NexusUnavailable } from "@/components/tasks/business-formation/name/NexusUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { NameAvailability } from "@businessnjgovnavigator/shared/";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext } from "react";

export const NexusSearchBusinessNameStep = (): ReactElement => {
  const { setFormationFormData, setFieldsInteracted, setBusinessNameAvailability } =
    useContext(BusinessFormationContext);
  const { updateQueue } = useUserData();
  const { Config } = useConfig();
  const FIELD_NAME = "businessName";

  const _setBusinessNameAvailability = (nameAvailability: NameAvailability | undefined): void => {
    setBusinessNameAvailability(nameAvailability);
  };

  const onSubmit = async (
    submittedName: string,
    nameAvailability: NameAvailability,
    isInitialSubmit: boolean
  ): Promise<void> => {
    if (!nameAvailability || !updateQueue || isInitialSubmit) {
      return;
    }
    setFieldsInteracted([FIELD_NAME]);
    if (nameAvailability.status === "AVAILABLE") {
      await updateQueue
        .queueFormationData({
          formationFormData: {
            ...updateQueue.current().formationData.formationFormData,
            businessName: submittedName,
          },
          businessNameAvailability: nameAvailability,
        })
        .queueProfileData({
          businessName: submittedName,
          nexusDbaName: emptyProfileData.nexusDbaName,
          needsNexusDbaName: emptyProfileData.needsNexusDbaName,
        })
        .update();
    } else if (nameAvailability.status === "UNAVAILABLE") {
      await updateQueue
        .queueFormationData({
          formationFormData: {
            ...updateQueue.current().formationData.formationFormData,
            businessName: submittedName,
          },
          businessNameAvailability: nameAvailability,
        })
        .queueProfileData({
          businessName: submittedName,
          needsNexusDbaName: true,
        })
        .update();
    }

    setFormationFormData((previousFormationData) => {
      return {
        ...previousFormationData,
        businessName: submittedName,
      };
    });
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
        onChange={_setBusinessNameAvailability}
        className="grid-col-12"
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "search-availability",
        }}
      />
    </div>
  );
};
