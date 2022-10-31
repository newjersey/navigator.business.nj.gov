import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { NexusAvailable } from "@/components/tasks/search-business-name/NexusAvailable";
import { NexusUnavailable } from "@/components/tasks/search-business-name/NexusUnavailable";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { buildUserRoadmap } from "@/lib/roadmap/buildUserRoadmap";
import { NameAvailability, Task } from "@/lib/types/types";
import { getModifiedTaskContent } from "@/lib/utils/helpers";
import { emptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useContext } from "react";

interface Props {
  task: Task;
}

export const NexusSearchBusinessNameTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { setRoadmap } = useContext(RoadmapContext);
  const { userData, update } = useUserData();
  const { Config } = useConfig();

  const onSubmit = async (
    submittedName: string,
    nameAvailability: NameAvailability,
    isInitialSubmit: boolean
  ): Promise<void> => {
    if (!nameAvailability || !userData || isInitialSubmit) {
      return;
    }
    let newUserData;
    if (nameAvailability.status === "AVAILABLE") {
      newUserData = {
        ...userData,
        profileData: {
          ...userData.profileData,
          businessName: submittedName,
          nexusDbaName: emptyProfileData.nexusDbaName,
        },
      };
    } else if (nameAvailability.status === "UNAVAILABLE") {
      newUserData = {
        ...userData,
        profileData: {
          ...userData.profileData,
          businessName: submittedName,
          nexusDbaName: "",
        },
      };
    }

    if (newUserData) {
      const newRoadmap = await buildUserRoadmap(newUserData.profileData);
      setRoadmap(newRoadmap);
      return update(newUserData);
    }

    return;
  };

  return (
    <>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
      <SearchBusinessNameForm
        unavailable={NexusUnavailable}
        available={NexusAvailable}
        hideTextFieldWhenUnavailable={true}
        onSubmit={onSubmit}
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "search-availability",
          inputPlaceholderText: Config.searchBusinessNameTask.placeholderText,
        }}
      />
    </>
  );
};
