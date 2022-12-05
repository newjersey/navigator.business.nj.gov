import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { ReactElement, useContext } from "react";

export const ProfileNexusBusinessNameField = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["nexusBusinessName"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "nexusBusinessName",
    });

  const renderUserEmptyBusinessName = () => {
    return (
      <div>
        <div className="flex">
          <h3 className="margin-right-105">{contentFromConfig.outOfStateNameHeader}</h3>
          <a href="/tasks/search-business-name-nexus">{contentFromConfig.addButton}</a>
        </div>
        <div className="italic">
          <i>{contentFromConfig.emptyBusinessPlaceHolder}</i>
        </div>
      </div>
    );
  };

  const renderUserBusinessName = () => {
    return (
      <div>
        <div className="flex">
          <h3 className="margin-right-105">{contentFromConfig.outOfStateNameHeader}</h3>
          <a href="/tasks/search-business-name-nexus">{contentFromConfig.editButton}</a>
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
