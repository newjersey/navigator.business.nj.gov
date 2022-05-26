import { BusinessPersona } from "@businessnjgovnavigator/shared";

export const routeForPersona = (persona: BusinessPersona): string => {
  switch (persona) {
    case "OWNING":
      return "/dashboard";
    case "STARTING":
      return "/roadmap";
    default:
      return "/roadmap";
  }
};
