import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { formationTaskId } from "@businessnjgovnavigator/shared/index";
import { ReactElement, ReactNode, useContext } from "react";

export const ProfileNexusBusinessNameField = (): ReactElement => {
  const { Config } = useConfig();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["nexusBusinessName"]["default"] =
    getProfileConfig({
      config: Config,
      persona: state.flow,
      fieldName: "nexusBusinessName",
    });

  const renderUserEmptyBusinessName = (): ReactNode => {
    return (
      <div>
        <div className="flex">
          <h3 className="margin-right-105">{contentFromConfig.outOfStateNameHeader}</h3>
          <a href={`/tasks/${formationTaskId}`}>{contentFromConfig.addButton}</a>
        </div>
        <div className="italic">
          <i>{contentFromConfig.emptyBusinessPlaceHolder}</i>
        </div>
      </div>
    );
  };

  const renderUserBusinessName = (): ReactNode => {
    return (
      <div>
        <div className="flex">
          <h3 className="margin-right-105">{contentFromConfig.outOfStateNameHeader}</h3>
          <a href={`/tasks/${formationTaskId}`}>{contentFromConfig.editButton}</a>
        </div>
        <div>{state?.profileData.businessName}</div>
      </div>
    );
  };

  return (
    <>
      {!state?.profileData.businessName || state?.profileData.businessName === ""
        ? renderUserEmptyBusinessName()
        : renderUserBusinessName()}
    </>
  );
};
