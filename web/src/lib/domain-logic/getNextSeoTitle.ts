import { getMergedConfig } from "@/contexts/configContext";

const config = getMergedConfig();

export const getNextSeoTitle = (pageName: string): string => {
  return `${pageName} | ${config.pagesMetadata.titlePostfix}`;
};
