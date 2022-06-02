import { BusinessPersona } from "@businessnjgovnavigator/shared";

// slug in the form profiletab-info-poppy
export const getMetadataFromSlug = (
  slug: string
): { profileTab: string; businessPersona: BusinessPersona } => {
  const [, tab, persona] = slug.split("-");
  const businessPersona = (() => {
    switch (persona) {
      case "oscar":
        return "OWNING";
      case "poppy":
        return "STARTING";
      case "dakota":
        return "FOREIGN";
      default:
        return "STARTING";
    }
  })();
  return {
    profileTab: tab,
    businessPersona,
  };
};
