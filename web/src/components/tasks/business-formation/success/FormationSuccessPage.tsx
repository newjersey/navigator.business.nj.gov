import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { FormationSuccessDocument } from "@/components/tasks/business-formation/success/FormationSuccessDocument";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useDocuments } from "@/lib/data-hooks/useDocuments";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  business: Business;
}

export const FormationSuccessPage = (props: Props): ReactElement<any> => {
  const { documents } = useDocuments();
  const { Config } = useConfig();

  useMountEffect(() => {
    analytics.event.business_formation_success_screen.arrive.arrive_from_NIC_formation_processing();
  });

  return (
    <>
      <div className="fdc fac margin-bottom-2" data-testid="formation-success-page">
        <img src={`/img/trophy-illustration.svg`} alt="" />
        <Heading level={2} className="margin-bottom-0">
          {Config.formation.successPage.header}
        </Heading>
        <p className="text-center">{Config.formation.successPage.subheader}</p>
        <p className="text-center">{Config.formation.successPage.body}</p>
      </div>

      <div className="fdr fww">
        <FormationSuccessDocument
          label={Config.formation.successPage.formationDocLabel}
          downloadLink={documents?.formationDoc ?? "#"}
          icon="formation-icon-blue"
        />
        {props.business.profileData.documents.standingDoc && (
          <FormationSuccessDocument
            label={Config.formation.successPage.standingDocLabel}
            downloadLink={documents?.standingDoc ?? "#"}
            icon="certificate-icon"
          />
        )}
        {props.business.profileData.documents.certifiedDoc && (
          <FormationSuccessDocument
            label={Config.formation.successPage.certifiedDocLabel}
            downloadLink={documents?.certifiedDoc ?? "#"}
            icon="formation-icon-purple"
          />
        )}
        <FormationSuccessDocument
          label={Config.formation.successPage.entityIdLabel}
          downloadLink=""
          subLabel={props.business.formationData.getFilingResponse?.entityId}
          icon="id-icon"
        />
      </div>

      <p className="text-center font-body-2xs">
        {Config.formation.successPage.confirmationNumberLabel}
        <span className="margin-left-05">
          {props.business.formationData.getFilingResponse?.confirmationNumber}
        </span>
      </p>
      <div className="text-center">
        <Content
          onClick={
            analytics.event.business_formation_success_amendments_external_link.click
              .go_to_Treasury_amendments_page
          }
        >
          {Config.formation.successPage.amendmentText}
        </Content>
      </div>
    </>
  );
};
