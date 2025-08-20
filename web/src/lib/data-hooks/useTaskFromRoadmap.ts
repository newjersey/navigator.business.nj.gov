import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { getTaskFromRoadmap } from "@/lib/utils/roadmap-helpers";
import { Task } from "@businessnjgovnavigator/shared/types";
import { useMemo } from "react";

export const useTaskFromRoadmap = (id: string): Task | undefined => {
  const { roadmap } = useRoadmap();
  return useMemo(() => {
    return getTaskFromRoadmap(roadmap, id);
  }, [id, roadmap]);
};
