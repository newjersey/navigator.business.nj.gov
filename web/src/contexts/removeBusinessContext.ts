import { createContext } from "react";

export interface RemoveBusinessContextType {
  showRemoveBusinessModal: boolean;
  setShowRemoveBusinessModal: (value: boolean) => void;
}

export const RemoveBusinessContext = createContext<RemoveBusinessContextType>({
  showRemoveBusinessModal: false,
  setShowRemoveBusinessModal: () => {},
});
