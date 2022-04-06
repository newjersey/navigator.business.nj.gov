import { FormationSuccessDocument } from "@/components/tasks/business-formation/FormationSuccessDocument";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { UserData } from "@businessnjgovnavigator/shared";
import React, { ReactElement } from "react";

interface Props {
  userData: UserData;
}

export const FormationSuccessPage = (props: Props): ReactElement => {
  const { documents } = useDocuments();
  return (
    <>
      <div className="fdc fac margin-bottom-2">
        <img src={`/img/trophy-illustration.svg`} alt="" />
        <h2 className="margin-bottom-0">{Config.businessFormationDefaults.successPageHeader}</h2>
        <p className="text-center">{Config.businessFormationDefaults.successPageSubheader}</p>
        <p className="text-center">{Config.businessFormationDefaults.successPageBody}</p>
      </div>

      <div className="fdr fww">
        <FormationSuccessDocument
          label={Config.businessFormationDefaults.formationDocLabel}
          downloadLink={documents?.formationDoc ?? "#"}
          icon="formation-icon-blue"
        />
        {props.userData.profileData.documents.standingDoc && (
          <FormationSuccessDocument
            label={Config.businessFormationDefaults.standingDocLabel}
            downloadLink={documents?.standingDoc ?? "#"}
            icon="certificate-icon"
          />
        )}
        {props.userData.profileData.documents.certifiedDoc && (
          <FormationSuccessDocument
            label={Config.businessFormationDefaults.certifiedDocLabel}
            downloadLink={documents?.certifiedDoc ?? "#"}
            icon="formation-icon-purple"
          />
        )}
        <FormationSuccessDocument
          label={Config.businessFormationDefaults.entityIdLabel}
          downloadLink=""
          subLabel={props.userData.formationData.getFilingResponse?.entityId}
          icon="id-icon"
        />
      </div>

      <p className="text-center font-body-2xs">
        {Config.businessFormationDefaults.confirmationNumberLabel}
        <span>{props.userData.formationData.getFilingResponse?.confirmationNumber}</span>
      </p>
    </>
  );
};
