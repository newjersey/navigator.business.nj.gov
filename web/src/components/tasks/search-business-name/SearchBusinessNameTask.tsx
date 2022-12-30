import { Content } from "@/components/Content";
import { TaskHeader } from "@/components/TaskHeader";
import { Available } from "@/components/tasks/search-business-name/Available";
import { SearchBusinessNameForm } from "@/components/tasks/search-business-name/SearchBusinessNameForm";
import { Unavailable } from "@/components/tasks/search-business-name/Unavailable";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Task } from "@/lib/types/types";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { ReactElement } from "react";

interface Props {
  task: Task;
}

export const SearchBusinessNameTask = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const { Config } = useConfig();

  return (
    <>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      <Content>{getModifiedTaskContent(roadmap, props.task, "contentMd")}</Content>
      <SearchBusinessNameForm
        unavailable={Unavailable}
        available={Available}
        config={{
          searchButtonText: Config.searchBusinessNameTask.searchButtonText,
          searchButtonTestId: "search-availability",
          inputPlaceholderText: Config.searchBusinessNameTask.placeholderText,
        }}
      />
    </>
  );
};
