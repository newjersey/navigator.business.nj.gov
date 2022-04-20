import { BrowserStorageFactory } from "@/lib/storage/BrowserStorage";
import { ABExperience } from "@businessnjgovnavigator/shared/";

interface ABStorage {
  getExperience: () => ABExperience | undefined;
  setExperience: (abExperience: ABExperience) => void;
}

export const abExperiencePrefix = "$navigatorABExperience$";

export const ABStorageFactory = (): ABStorage => {
  const browserStorage = BrowserStorageFactory("local");

  const getExperience = (): ABExperience | undefined => {
    const data = browserStorage.get(abExperiencePrefix);
    if (!data || (data !== "ExperienceA" && data !== "ExperienceB")) {
      return undefined;
    }
    return data;
  };

  const setExperience = (abExperience: ABExperience): void => {
    browserStorage.set(abExperiencePrefix, abExperience);
  };

  return {
    getExperience,
    setExperience,
  };
};
