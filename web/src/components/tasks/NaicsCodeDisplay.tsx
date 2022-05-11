import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import NaicsCodes from "@/lib/static/records/naics2022.json";
import { NaicsCodeObject } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

interface Props {
  onEdit: () => void;
  code: string;
}

export const NaicsCodeDisplay = (props: Props): ReactElement => {
  const codeObject = (NaicsCodes as NaicsCodeObject[]).find(
    (element) => element?.SixDigitCode?.toString() == props.code
  );
  return (
    <>
      <h2 className="text-normal">{Config.determineNaicsCode.hasSavedCodeHeader}</h2>
      <Alert variant="success">
        <Content>{templateEval(Config.determineNaicsCode.successMessage, { code: props.code })}</Content>
      </Alert>
      <div className="margin-left-3">
        <span className="text-bold margin-right-2">{props.code}</span>
        <span className="margin-right-2">{codeObject?.SixDigitDescription}</span>
        <Button style="tertiary" onClick={props.onEdit}>
          {Config.determineNaicsCode.editText}
        </Button>
      </div>
    </>
  );
};
