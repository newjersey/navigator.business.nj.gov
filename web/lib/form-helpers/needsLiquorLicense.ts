import { BusinessForm } from "../types/form";

export const needsLiquorLicense = (formData: BusinessForm): boolean => {
  if (!formData.locations?.locations) {
    return false;
  }

  return formData.locations.locations.some((it) => it.license);
};
