import { UpdateQueue } from "@/lib/types/types";
import { createContext } from "react";

export interface UpdateQueueContextType {
  updateQueue: UpdateQueue | undefined;
  setUpdateQueue: (updateQueue: UpdateQueue) => void;
}

export const UpdateQueueContext = createContext<UpdateQueueContextType>({
  updateQueue: undefined,
  setUpdateQueue: () => {}
});
