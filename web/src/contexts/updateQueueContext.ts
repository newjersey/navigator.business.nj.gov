import { createContext } from "react";
import type { UpdateQueue } from "@/lib/UpdateQueue";

export interface UpdateQueueContextType {
  updateQueue: UpdateQueue | undefined;
  setUpdateQueue: (updateQueue: UpdateQueue | undefined) => void;
}

export const UpdateQueueContext = createContext<UpdateQueueContextType>({
  updateQueue: undefined,
  setUpdateQueue: () => {},
});
