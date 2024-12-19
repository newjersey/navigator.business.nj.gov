import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { displayAsEin } from "@/lib/utils/displayAsEin";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  onEdit: () => void;
  onRemove: () => void;
  employerId: string;
}

export const EinDisplay = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <Alert variant="success">
      <div className="desktop:display-flex flex-row">
        <div className="margin-right-1">
          <Content>{templateEval(Config.ein.successText, { ein: displayAsEin(props.employerId) })}</Content>
        </div>
        <UnStyledButton
          isUnderline
          onClick={props.onEdit}
          ariaLabel={`${Config.taskDefaults.editText} ${Config.ein.ariaLabelText}`}
        >
          {Config.taskDefaults.editText}
        </UnStyledButton>
        <span className="margin-x-105">|</span>
        <UnStyledButton
          isUnderline
          onClick={props.onRemove}
          ariaLabel={`${Config.taskDefaults.removeText} ${Config.ein.ariaLabelText}`}
        >
          {Config.taskDefaults.removeText}
        </UnStyledButton>
      </div>
    </Alert>
  );
};
