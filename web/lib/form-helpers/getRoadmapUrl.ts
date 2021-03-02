import { BusinessForm } from "../types/form";

export const getRoadmapUrl = (formData: BusinessForm): string => {
  if (formData.businessType) {
    return `/roadmaps/${formData.businessType.businessType}`;
  } else {
    return "/";
  }
};
