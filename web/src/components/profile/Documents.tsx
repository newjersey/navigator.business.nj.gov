import { Content } from "@/components/Content";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { UserData } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext, useMemo } from "react";

interface Props {
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
}

export const Documents = (props: Props): ReactElement => {
  const userDataFromHook = useUserData();
  const { Config } = useConfig();
  const { documents } = useDocuments();
  const { state } = useContext(ProfileDataContext);

  const contentFromConfig: ConfigType["profileDefaults"]["fields"]["documents"]["default"] = getProfileConfig(
    {
      config: Config,
      persona: state.flow,
      fieldName: "documents",
    }
  );

  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;

  const listOfDocuments = useMemo(() => {
    return Object.values(userData?.profileData.documents ?? {});
  }, [userData?.profileData.documents]);

  return (
    <div className="margin-bottom-6" data-testid={`profileContent-documents`}>
      {listOfDocuments.some((value) => {
        return !!value;
      }) ? (
        <ol className="padding-left-3 padding-top-1">
          {userData?.profileData.documents.formationDoc ? (
            <li>
              <a href={documents?.formationDoc ?? "#"} target="_blank" rel="noreferrer noopener">
                {Config.profileDefaults.formationDocFileTitle}
              </a>{" "}
              (PDF)
            </li>
          ) : (
            <></>
          )}
          {userData?.profileData.documents.certifiedDoc ? (
            <li>
              <a href={documents?.certifiedDoc ?? "#"} target="_blank" rel="noreferrer noopener">
                {" "}
                {Config.profileDefaults.certificationDocFileTitle}
              </a>{" "}
              (PDF)
            </li>
          ) : (
            <></>
          )}
          {userData?.profileData.documents.standingDoc ? (
            <li>
              <a href={documents?.standingDoc ?? "#"} target="_blank" rel="noreferrer noopener">
                {" "}
                {Config.profileDefaults.standingDocFileTitle}
              </a>{" "}
              (PDF)
            </li>
          ) : (
            <></>
          )}
        </ol>
      ) : (
        <Content>{contentFromConfig.placeholder}</Content>
      )}
    </div>
  );
};
