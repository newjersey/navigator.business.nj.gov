import { getIndustries } from "@businessnjgovnavigator/shared/industry";

export const STARTER_KITS_GENERIC_SLUG = "nj-business";

type PathParameters<P> = { params: P; locale?: string };

export type StarterKitsUrl = {
  starterKitsUrl: string;
};

export const getAllStarterKitUrls = (): PathParameters<StarterKitsUrl>[] => {
  return getIndustries().map((industry) => {
    if (industry.id === "generic") {
      return {
        params: {
          starterKitsUrl: STARTER_KITS_GENERIC_SLUG,
        },
      };
    }

    return {
      params: {
        starterKitsUrl: industry.id,
      },
    };
  });
};
