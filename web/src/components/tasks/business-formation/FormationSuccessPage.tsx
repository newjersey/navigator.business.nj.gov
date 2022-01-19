import { FormationSuccessDocument } from "@/components/tasks/business-formation/FormationSuccessDocument";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { templateEval } from "@/lib/utils/helpers";
import { GetFilingResponse } from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import React, { ReactElement } from "react";

interface Props {
  getFilingResponse: GetFilingResponse;
}

export const FormationSuccessPage = (props: Props): ReactElement => {
  const datePlusThirty = dayjs(props.getFilingResponse.transactionDate).add(30, "days").format("MM/DD/YYYY");
  const bodyText = templateEval(BusinessFormationDefaults.successPageBody, {
    expirationDate: datePlusThirty,
  });

  return (
    <>
      <div className="fdc fac margin-bottom-2">
        <img src={`/img/trophy-illustration.svg`} alt="" />
        <h2 className="margin-bottom-0">{BusinessFormationDefaults.successPageHeader}</h2>
        <p className="text-center font-body-md">{BusinessFormationDefaults.successPageSubheader}</p>
        <p className="text-center">{bodyText}</p>
      </div>

      <div className="fdr fww">
        <FormationSuccessDocument
          label={BusinessFormationDefaults.formationDocLabel}
          downloadLink={props.getFilingResponse.formationDoc}
          icon="formation-icon-blue"
        />
        <FormationSuccessDocument
          label={BusinessFormationDefaults.standingDocLabel}
          downloadLink={props.getFilingResponse.standingDoc}
          icon="certificate-icon"
        />
        <FormationSuccessDocument
          label={BusinessFormationDefaults.certifiedDocLabel}
          downloadLink={props.getFilingResponse.certifiedDoc}
          icon="formation-icon-purple"
        />
        <FormationSuccessDocument
          label={BusinessFormationDefaults.entityIdLabel}
          downloadLink=""
          subLabel={props.getFilingResponse.entityId}
          icon="id-icon"
        />
      </div>

      <p className="text-center font-body-2xs">
        {BusinessFormationDefaults.confirmationNumberLabel}{" "}
        <span>{props.getFilingResponse.confirmationNumber}</span>
      </p>
    </>
  );
};
