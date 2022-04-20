import { County, Funding } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared/";

export const filterFundings = (fundings: Funding[], userData: UserData): Funding[] => {
  return fundings.filter((it) => {
    if (it.publishStageArchive === "Do Not Publish") return false;

    if (userData.profileData.homeBasedBusiness && it.homeBased !== "yes" && it.homeBased !== "unknown")
      return false;

    if (userData.profileData.municipality && it.county.length > 0) {
      if (
        !it.county.includes("All") &&
        !it.county.includes(userData.profileData.municipality.county as County)
      )
        return false;
    }

    if (userData.profileData.sectorId && it.sector.length > 0) {
      const sectorRegex = new RegExp(it.sector.join("|"), "i");
      if (!sectorRegex.test(userData.profileData.sectorId)) return false;
    }

    if (userData.profileData.existingEmployees && it.employeesRequired) {
      if (parseInt(userData.profileData.existingEmployees) === 0 && it.employeesRequired !== "n/a")
        return false;
    }

    if (it.status === "closed" || it.status === "opening soon") return false;

    return true;
  });
};
