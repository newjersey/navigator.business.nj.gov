import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { ExistingEmployees } from "@/components/data-fields/ExistingEmployees";
import { MunicipalityField } from "@/components/data-fields/MunicipalityField";
import { Ownership } from "@/components/data-fields/Ownership";
import { shouldLockMunicipality } from "@/components/profile/profileDisplayLogicHelpers";
import { ProfileField } from "@/components/profile/ProfileField";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { ReactElement, useContext } from "react";

export const CertificationsAndFundingNonEssentialQuestions = (props: {
  showCannabisAlert?: boolean;
}): ReactElement => {
  const { business } = useUserData();
  const { state: profileDataState } = useContext(ProfileDataContext);
  const profileData = profileDataState.profileData;
  const isOwningBusiness = profileData.businessPersona === "OWNING";

  return (
    <>
      <div className={"padding-bottom-1"}>
        <ProfileField
          fieldName="municipality"
          locked={shouldLockMunicipality(profileData, business)}
          hideLine
        >
          {props.showCannabisAlert && <CannabisLocationAlert industryId={profileData.industryId} />}
          <MunicipalityField />
        </ProfileField>
      </div>

      <div className={"padding-bottom-1"}>
        <ProfileField
          fieldName="ownershipTypeIds"
          isVisible={
            LookupOperatingPhaseById(business?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields || isOwningBusiness
          }
          hideLine
        >
          <Ownership />
        </ProfileField>
      </div>

      <div className={"padding-bottom-1"}>
        <ProfileField
          fieldName="existingEmployees"
          isVisible={
            LookupOperatingPhaseById(business?.profileData.operatingPhase)
              .displayCompanyDemographicProfileFields || isOwningBusiness
          }
          hideLine
        >
          <ExistingEmployees />
        </ProfileField>
      </div>
    </>
  );
};
