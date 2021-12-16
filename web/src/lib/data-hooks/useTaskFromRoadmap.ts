import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Task } from "@/lib/types/types";
import { getTaskFromRoadmap } from "@/lib/utils/helpers";
import { useMemo } from "react";

export const useTaskFromRoadmap = (id: string): Task | undefined => {
  const { roadmap } = useRoadmap();
  return useMemo(() => getTaskFromRoadmap(roadmap, id), [id, roadmap]);
};
