import { createContext, Dispatch, SetStateAction } from "react";

export interface ContextualInfo {
  isVisible: boolean;
  markdown: string;
}

export interface ContextualInfoContextType {
  contextualInfo: ContextualInfo;
  setContextualInfo: Dispatch<SetStateAction<ContextualInfo>>;
}

export const ContextualInfoContext = createContext<ContextualInfoContextType>({
  contextualInfo: {
    isVisible: false,
    markdown: "",
  },
  setContextualInfo: () => {},
});
