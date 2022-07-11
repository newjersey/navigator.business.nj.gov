import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement } from "react";
export const ProfileNexusBusinessNameField = (): ReactElement => {
  const userData = useUserData();
  const { Config } = useConfig();

  return (
    <>
      {userData.userData?.profileData.businessName === "" ||
      userData.userData?.profileData.businessName === undefined ? (
        <div>
          <div className="flex">
            <h3 className="margin-right-105">
              {Config.profileDefaults.nexusBusinessName.outOfStateNameHeader}
            </h3>
            <a href="/tasks/search-business-name-nexus">
              {Config.profileDefaults.nexusBusinessName.addButton}
            </a>
          </div>
          <div className="italic">
            <i>{Config.profileDefaults.nexusBusinessName.emptyBusinessPlaceHolder}</i>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex">
            <h3 className="margin-right-105">
              {Config.profileDefaults.nexusBusinessName.outOfStateNameHeader}
            </h3>
            <a href="/tasks/search-business-name-nexus">
              {Config.profileDefaults.nexusBusinessName.editButton}
            </a>
          </div>
          <div>{userData.userData?.profileData.businessName}</div>
        </div>
      )}{" "}
    </>
  );
};
