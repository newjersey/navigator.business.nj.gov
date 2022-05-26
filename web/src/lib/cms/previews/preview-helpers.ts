import { BusinessPersona } from "@businessnjgovnavigator/shared";

// slug in the form profiletab-info-poppy
export const getMetadataFromSlug = (
  slug: string
): { profileTab: string; businessPersona: BusinessPersona } => {
  const [, tab, persona] = slug.split("-");
  return {
    profileTab: tab,
    businessPersona: persona === "oscar" ? "OWNING" : "STARTING",
  };
};
