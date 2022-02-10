import { County, Opportunity } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared";

export const filterOpportunities = (opportunities: Opportunity[], userData: UserData): Opportunity[] => {
  return opportunities.filter((it) => {
    if (userData.profileData.homeBasedBusiness) {
      return it.homeBased === "yes" || it.homeBased === "unknown";
    }

    if (userData.profileData.municipality && it.county.length > 0) {
      return (
        it.county.includes("All") || it.county.includes(userData.profileData.municipality.county as County)
      );
    }

    if (userData.profileData.sectorId && it.industry.length > 0) {
      return it.industry.includes(userData.profileData.sectorId);
    }

    if (userData.profileData.existingEmployees) {
      if (parseInt(userData.profileData.existingEmployees) === 0) {
        return it.businessSize === "n/a";
      }
    }

    return it.publishStageArchive !== "Do Not Publish";
  });
};
