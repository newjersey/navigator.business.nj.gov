import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

interface Props {
  readonly onEdit: () => void;
  readonly code: string;
}

export const NaicsCodeDisplay = (props: Props): ReactElement => {
  return (
    <>
      <h2 className="text-normal">{Config.determineNaicsCode.hasSavedCodeHeader}</h2>
      <Alert variant="success">
        <Content>{templateEval(Config.determineNaicsCode.successMessage, { code: props.code })}</Content>
      </Alert>
      <div className="margin-left-3">
        <span className="text-bold margin-right-2">{props.code}</span>
        <Button style="tertiary" onClick={props.onEdit}>
          {Config.determineNaicsCode.editText}
        </Button>
      </div>
    </>
  );
};
