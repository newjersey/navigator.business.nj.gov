import { Content } from "@/components/Content";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { UserDisplayContent } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useMemo } from "react";

interface Props {
  displayContent: UserDisplayContent;
}

export const Documents = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const { documents } = useDocuments();
  const listOfDocuments = useMemo(
    () => Object.values(userData?.profileData.documents ?? {}),
    [userData?.profileData.documents]
  );

  return (
    <div className="margin-top-4 margin-bottom-6">
      <div className="margin-bottom-2" data-testid={`profileContent-documents`}>
        <Content>{props.displayContent.documents.contentMd}</Content>
      </div>
      {listOfDocuments.some((value) => !!value) ? (
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
        <ul>
          <li>{props.displayContent.documents.placeholder}</li>
        </ul>
      )}
    </div>
  );
};
