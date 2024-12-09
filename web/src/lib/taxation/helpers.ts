import { postTaxFilingsOnboarding } from "@/lib/api-client/apiClient";
import { UpdateQueue } from "@/lib/types/types";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";

const displayBusinessName = (profileData: ProfileData): boolean => {
  return LookupLegalStructureById(profileData.legalStructureId).elementsToDisplay.has("businessName");
};

const displayResponsibleOwnerName = (profileData: ProfileData): boolean => {
  return LookupLegalStructureById(profileData.legalStructureId).elementsToDisplay.has("responsibleOwnerName");
};

interface Props {
  updateQueue: UpdateQueue;
  optionalProfileDataIfSeparateContext?: ProfileData;
}
// the aim of this fn is to hit postTaxFilingsOnboarding and staged update queue
export const toBeNamed = async (props: Props) => {
  const currentBusiness = props.updateQueue.currentBusiness();
  const updateQueue = props.updateQueue;
  const profileData = props.optionalProfileDataIfSeparateContext || currentBusiness.profileData;
  let encryptedTaxIdToSubmitToTaxApi = "";
  let businessNameToSubmitToTaxApi = "";
  const taxIdToSubmitToTaxApi = profileData.taxId || "";
  const displayBusinessNameValue = displayBusinessName(profileData);
  const displayResponsibleOwnerNameValue = displayResponsibleOwnerName(profileData);

  if (profileData.taxId === currentBusiness.profileData.taxId) {
    encryptedTaxIdToSubmitToTaxApi = profileData.encryptedTaxId || ""; // handling for undefined when hitting api
  }
  if (displayBusinessNameValue) {
    businessNameToSubmitToTaxApi = profileData.businessName;
  }
  if (displayResponsibleOwnerNameValue) {
    businessNameToSubmitToTaxApi = profileData.responsibleOwnerName;
  }

  const userDataToSet = await postTaxFilingsOnboarding({
    taxId: taxIdToSubmitToTaxApi,
    businessName: businessNameToSubmitToTaxApi,
    encryptedTaxId: encryptedTaxIdToSubmitToTaxApi,
  });

  updateQueue.queue(userDataToSet).queueProfileData({
    taxId: taxIdToSubmitToTaxApi,
    encryptedTaxId: encryptedTaxIdToSubmitToTaxApi ?? undefined, // reverting back to undefined
  });

  if (getCurrentBusiness(userDataToSet).taxFilingData.state === "SUCCESS") {
    if (displayBusinessNameValue) {
      updateQueue.queueProfileData({
        businessName: profileData.businessName,
      });
    }

    if (displayResponsibleOwnerNameValue) {
      updateQueue.queueProfileData({
        responsibleOwnerName: profileData.responsibleOwnerName,
      });
    }
  }
};
