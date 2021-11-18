import { useMemo } from "react";
import { getTaskFromRoadmap } from "@/lib/utils/helpers";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Task } from "@/lib/types/types";

export const useTaskFromRoadmap = (id: string): Task | undefined => {
  const { roadmap } = useRoadmap();
  return useMemo(() => getTaskFromRoadmap(roadmap, id), [id, roadmap]);
};
