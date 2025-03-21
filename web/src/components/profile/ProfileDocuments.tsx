import { Content } from "@/components/Content";
import { ConfigType } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getProfileConfig } from "@/lib/domain-logic/getProfileConfig";
import { Business } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext, useMemo } from "react";

interface Props {
  CMS_ONLY_fakeBusiness?: Business;
}

export const ProfileDocuments = (props: Props): ReactElement => {
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
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

  const listOfDocuments = useMemo(() => {
    return Object.values(business?.profileData.documents ?? {});
  }, [business?.profileData.documents]);

  return (
    <div className="margin-bottom-6" data-testid={`profileContent-documents`}>
      {listOfDocuments.some((value) => {
        return !!value;
      }) ? (
        <ol className="padding-left-3 padding-top-1">
          {business?.profileData.documents.formationDoc ? (
            <li>
              <a href={documents?.formationDoc ?? "#"} target="_blank" rel="noreferrer noopener">
                {Config.profileDefaults.default.formationDocFileTitle}
              </a>{" "}
              (PDF)
            </li>
          ) : (
            <></>
          )}
          {business?.profileData.documents.certifiedDoc ? (
            <li>
              <a href={documents?.certifiedDoc ?? "#"} target="_blank" rel="noreferrer noopener">
                {" "}
                {Config.profileDefaults.default.certificationDocFileTitle}
              </a>{" "}
              (PDF)
            </li>
          ) : (
            <></>
          )}
          {business?.profileData.documents.standingDoc ? (
            <li>
              <a href={documents?.standingDoc ?? "#"} target="_blank" rel="noreferrer noopener">
                {" "}
                {Config.profileDefaults.default.standingDocFileTitle}
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
