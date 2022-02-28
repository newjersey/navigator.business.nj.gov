import { FormationSuccessDocument } from "@/components/tasks/business-formation/FormationSuccessDocument";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { GetFilingResponse } from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import React, { ReactElement } from "react";

interface Props {
  getFilingResponse: GetFilingResponse;
}

export const FormationSuccessPage = (props: Props): ReactElement => {
  const datePlusThirty = dayjs(props.getFilingResponse.transactionDate).add(30, "days").format("MM/DD/YYYY");
  const bodyTextSplit = Config.businessFormationDefaults.successPageBody.split("${expirationDate}");
  const bodyText = (
    <>
      {bodyTextSplit[0]} <b>{datePlusThirty}</b> {bodyTextSplit[1]}
    </>
  );

  return (
    <>
      <div className="fdc fac margin-bottom-2">
        <img src={`/img/trophy-illustration.svg`} alt="" />
        <h2 className="margin-bottom-0">{Config.businessFormationDefaults.successPageHeader}</h2>
        <p className="text-center">{Config.businessFormationDefaults.successPageSubheader}</p>
        <p className="text-center">{bodyText}</p>
      </div>

      <div className="fdr fww">
        <FormationSuccessDocument
          label={Config.businessFormationDefaults.formationDocLabel}
          downloadLink={props.getFilingResponse.formationDoc}
          icon="formation-icon-blue"
        />
        {props.getFilingResponse.standingDoc && (
          <FormationSuccessDocument
            label={Config.businessFormationDefaults.standingDocLabel}
            downloadLink={props.getFilingResponse.standingDoc}
            icon="certificate-icon"
          />
        )}
        {props.getFilingResponse.certifiedDoc && (
          <FormationSuccessDocument
            label={Config.businessFormationDefaults.certifiedDocLabel}
            downloadLink={props.getFilingResponse.certifiedDoc}
            icon="formation-icon-purple"
          />
        )}
        <FormationSuccessDocument
          label={Config.businessFormationDefaults.entityIdLabel}
          downloadLink=""
          subLabel={props.getFilingResponse.entityId}
          icon="id-icon"
        />
      </div>

      <p className="text-center font-body-2xs">
        {Config.businessFormationDefaults.confirmationNumberLabel}{" "}
        <span>{props.getFilingResponse.confirmationNumber}</span>
      </p>
    </>
  );
};
