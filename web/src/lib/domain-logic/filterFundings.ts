import { County, Funding } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared";

export const filterFundings = (fundings: Funding[], userData: UserData): Funding[] => {
  return fundings.filter((it) => {
    let allowedFunding = true;
    if (userData.profileData.homeBasedBusiness && it.homeBased !== "yes" && it.homeBased !== "unknown") {
      allowedFunding = false;
    }

    if (userData.profileData.municipality && it.county.length > 0) {
      if (
        !it.county.includes("All") &&
        !it.county.includes(userData.profileData.municipality.county as County)
      ) {
        allowedFunding = false;
      }
    }

    if (userData.profileData.sectorId && it.sector.length > 0) {
      const sectorRegex = new RegExp(it.sector.join("|"), "i");
      if (!sectorRegex.test(userData.profileData.sectorId)) {
        allowedFunding = false;
      }
    }

    if (userData.profileData.existingEmployees && it.employeesRequired) {
      if (parseInt(userData.profileData.existingEmployees) === 0 && it.employeesRequired !== "n/a") {
        allowedFunding = false;
      }
    }

    if (it.publishStageArchive === "Do Not Publish") {
      allowedFunding = false;
    }

    return allowedFunding;
  });
};
