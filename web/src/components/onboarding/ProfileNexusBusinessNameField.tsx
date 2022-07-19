import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";
export const ProfileNexusBusinessNameField = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const renderUserEmptyBusinessName = () => {
    return (
      <div>
        <div className="flex">
          <h3 className="margin-right-105">
            {Config.profileDefaults.nexusBusinessName.outOfStateNameHeader}
          </h3>
          <a href="/tasks/search-business-name-nexus">{Config.profileDefaults.nexusBusinessName.addButton}</a>
        </div>
        <div className="italic">
          <i>{Config.profileDefaults.nexusBusinessName.emptyBusinessPlaceHolder}</i>
        </div>
      </div>
    );
  };

  const renderUserBusinessName = () => {
    return (
      <div>
        <div className="flex">
          <h3 className="margin-right-105">
            {Config.profileDefaults.nexusBusinessName.outOfStateNameHeader}
          </h3>
          <a href="/tasks/search-business-name-nexus">
            {Config.profileDefaults.nexusBusinessName.editButton}
          </a>
        </div>
        <div>{state?.profileData.businessName}</div>
      </div>
    );
  };

  return (
    <>
      {!state?.profileData.businessName || state?.profileData.businessName == ""
        ? renderUserEmptyBusinessName()
        : renderUserBusinessName()}
    </>
  );
};
