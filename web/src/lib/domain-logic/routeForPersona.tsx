import { ROUTES } from "@/lib/domain-logic/routes";
import { BusinessPersona } from "@businessnjgovnavigator/shared";

export const routeForPersona = (persona: BusinessPersona): string => {
  switch (persona) {
    case "OWNING":
      return ROUTES.dashboard;
    case "STARTING":
      return ROUTES.roadmap;
    default:
      return ROUTES.roadmap;
  }
};
