import { ContextualInfo } from "@businessnjgovnavigator/shared/types";
import { createContext, Dispatch, SetStateAction } from "react";

export interface ContextualInfoContextType {
  contextualInfo: ContextualInfo;
  setContextualInfo: Dispatch<SetStateAction<ContextualInfo>>;
}

export const ContextualInfoContext = createContext<ContextualInfoContextType>({
  contextualInfo: {
    isVisible: false,
    header: "",
    markdown: "",
  },
  setContextualInfo: () => {},
});
