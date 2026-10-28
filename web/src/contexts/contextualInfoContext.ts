import type { ContextualInfo } from "@businessnjgovnavigator/shared/types";
import { createContext, type Dispatch, type SetStateAction } from "react";

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
