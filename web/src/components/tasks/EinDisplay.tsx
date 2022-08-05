import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  onEdit: () => void;
  onRemove: () => void;
  employerId: string;
}

export const EinDisplay = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <Alert variant="success">
      <div className="flex flex-row">
        <Content>{templateEval(Config.ein.successText, { ein: displayAsEin(props.employerId) })}</Content>
        <Button style="tertiary" onClick={props.onEdit} className="margin-left-1">
          {Config.ein.editText}
        </Button>
        <div className="margin-x-105">|</div>
        <Button style="tertiary" onClick={props.onRemove}>
          {Config.ein.removeText}
        </Button>
      </div>
    </Alert>
  );
};
