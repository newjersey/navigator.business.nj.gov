import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { formationTaskId } from "@businessnjgovnavigator/shared";
import { ReactElement, ReactNode, useContext } from "react";

export const NexusBusinessNameField = (): ReactElement<any> => {
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
          <div role="heading" aria-level={3} className="text-bold margin-bottom-05">
            {contentFromConfig.outOfStateNameHeader}
          </div>
          <a href={`/tasks/${formationTaskId}`} className="margin-left-2 margin-top-2px">
            {contentFromConfig.addButton}{" "}
          </a>
        </div>
        <div className="italic">
          <em>{contentFromConfig.emptyBusinessPlaceHolder}</em>
        </div>
      </div>
    );
  };

  const renderUserBusinessName = (): ReactNode => {
    return (
      <div>
        <div className="flex flex-row flex-align-center">
          <div role="heading" aria-level={3} className="text-bold margin-bottom-05">
            {contentFromConfig.outOfStateNameHeader}
          </div>
          <a
            href={`/tasks/${formationTaskId}`}
            className="text-accent-cool-darker margin-left-2"
            aria-label={`${contentFromConfig.editButton} ${contentFromConfig.outOfStateNameHeader}`}
          >
            {contentFromConfig.editButton}
          </a>
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
