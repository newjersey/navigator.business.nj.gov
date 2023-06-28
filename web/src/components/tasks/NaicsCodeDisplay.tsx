import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { lookupNaicsCode } from "@/lib/domain-logic/lookupNaicsCode";
import { templateEval } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  onEdit: () => void;
  onRemove: () => void;
  code: string;
  lockField: boolean;
}

export const NaicsCodeDisplay = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <h2 className="text-normal">{Config.determineNaicsCode.hasSavedCodeHeader}</h2>
      <Alert variant="success">
        <Content>{templateEval(Config.determineNaicsCode.successMessage, { code: props.code })}</Content>
      </Alert>
      <div className="margin-left-3 flex">
        <span className="text-bold margin-right-05">{props.code}</span>
        {"-"}
        <span className="margin-left-05 margin-right-2">
          {lookupNaicsCode(props.code)?.SixDigitDescription}
        </span>
        {props.lockField ? (
          <ArrowTooltip
            title={Config.profileDefaults.lockedFieldTooltipText}
            data-testid="naics-code-tooltip"
          >
            <div className="fdr fac font-body-lg">
              <Icon>help_outline</Icon>
            </div>
          </ArrowTooltip>
        ) : (
          <>
            <UnStyledButton style="default" isUnderline onClick={props.onEdit}>
              {Config.taskDefaults.editText}
            </UnStyledButton>
            <span className="margin-x-105">|</span>
            <UnStyledButton style="default" isUnderline onClick={props.onRemove}>
              {Config.taskDefaults.removeText}
            </UnStyledButton>
          </>
        )}
      </div>
    </>
  );
};
