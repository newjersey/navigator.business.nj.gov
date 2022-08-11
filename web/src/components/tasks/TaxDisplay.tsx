import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  onEdit: () => void;
  onRemove: () => void;
  taxId: string;
}

export const TaxDisplay = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <Alert variant="success">
      <div className="desktop:display-flex flex-row">
        <div className="margin-right-1">
          <Content>{templateEval(Config.tax.successText, { taxID: props.taxId })}</Content>
        </div>
        <Button style="tertiary" underline onClick={props.onEdit}>
          {Config.tax.editText}
        </Button>
        <span className="margin-x-105">|</span>
        <Button style="tertiary" underline onClick={props.onRemove}>
          {Config.tax.removeText}
        </Button>
      </div>
    </Alert>
  );
};
