import { getMergedConfig } from "@/contexts/configContext";

const config = getMergedConfig();

export const getNextSeoTitle = (pageName: string): string => {
  const baseURL = new URL(process.env.NEXT_PUBLIC_WEB_BASE_URL ?? "http://localhost:3000");

  const baseTitle = `${pageName} | ${config.pagesMetadata.titlePostfix}`;

  if (baseURL.hostname.includes("dev")) {
    return `[dev] | ${baseTitle}`;
  } else if (baseURL.hostname.includes("testing")) {
    return `[testing] | ${baseTitle}`;
  } else if (baseURL.hostname.includes("content")) {
    return `[content] | ${baseTitle}`;
  } else if (baseURL.hostname.includes("staging")) {
    return `[staging] | ${baseTitle}`;
  } else if (baseURL.hostname.includes("local")) {
    return `[local] | ${baseTitle}`;
  } else {
    return `${pageName} | ${config.pagesMetadata.titlePostfix}`;
  }
};
