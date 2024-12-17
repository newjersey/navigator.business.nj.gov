import { postTaxFilingsOnboarding } from "@/lib/api-client/apiClient";
import { UpdateQueue } from "@/lib/types/types";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { ProfileData } from "@businessnjgovnavigator/shared/profileData";

const displayBusinessName = (profileData: ProfileData): boolean => {
  const hasBusinessName = LookupLegalStructureById(profileData.legalStructureId).elementsToDisplay.has(
    "businessName"
  );
  const notEmptyString = profileData.businessName !== "";
  return hasBusinessName && notEmptyString;
};

const displayResponsibleOwnerName = (profileData: ProfileData): boolean => {
  const hasResponsibleOwnerName = LookupLegalStructureById(
    profileData.legalStructureId
  ).elementsToDisplay.has("responsibleOwnerName");
  const notEmptyString = profileData.responsibleOwnerName !== "";
  return hasResponsibleOwnerName && notEmptyString;
};

interface Props {
  updateQueue: UpdateQueue;
  stagedProfileData?: ProfileData;
}

export const gov2GovTaxFiling = async (props: Props): Promise<void> => {
  const currentBusiness = props.updateQueue.currentBusiness();

  const updateQueue = props.updateQueue;
  const profileData = props.stagedProfileData || currentBusiness.profileData;
  const displayBusinessNameValue = displayBusinessName(profileData);
  const displayResponsibleOwnerNameValue = displayResponsibleOwnerName(profileData);

  if (!displayBusinessNameValue && !displayResponsibleOwnerNameValue) return;
  if (!profileData.taxId) return;

  const encryptedTaxIdToSubmitToTaxApi =
    profileData.taxId === currentBusiness.profileData.taxId && profileData.encryptedTaxId
      ? profileData.encryptedTaxId
      : "";

  const businessNameToSubmitToTaxApi = displayBusinessNameValue
    ? profileData.businessName
    : profileData.responsibleOwnerName;

  const userDataToSet = await postTaxFilingsOnboarding({
    taxId: profileData.taxId,
    businessName: businessNameToSubmitToTaxApi,
    encryptedTaxId: encryptedTaxIdToSubmitToTaxApi,
  });

  updateQueue.queue(userDataToSet).queueProfileData({
    taxId: profileData.taxId,
    encryptedTaxId: encryptedTaxIdToSubmitToTaxApi,
  });
};
