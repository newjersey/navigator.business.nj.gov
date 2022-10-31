import { Content } from "@/components/Content";
import { FormationSuccessDocument } from "@/components/tasks/business-formation/success/FormationSuccessDocument";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { UserData } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

interface Props {
  userData: UserData;
}

export const FormationSuccessPage = (props: Props): ReactElement => {
  const { documents } = useDocuments();
  const { Config } = useConfig();

  useMountEffect(() => {
    analytics.event.business_formation_success_screen.arrive.arrive_from_NIC_formation_processing();
  });

  return (
    <>
      <div className="fdc fac margin-bottom-2" data-testid="formation-success-page">
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
        <span className="margin-left-05">
          {props.userData.formationData.getFilingResponse?.confirmationNumber}
        </span>
      </p>
      <div className="text-center">
        <Content
          onClick={() => {
            return analytics.event.business_formation_success_amendments_external_link;
          }}
        >
          {Config.businessFormationDefaults.successPageAmendmentText}
        </Content>
      </div>
    </>
  );
};
