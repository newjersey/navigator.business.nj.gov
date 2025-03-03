import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, ReactNode } from "react";

interface Props {
  headingText: string;
  children: ReactNode;
  editHandleButtonClick: () => void;
  dataTestId?: string;
  disableHorizontalLine?: boolean;
}

export const ReviewSection = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <>
      <div className={"flex space-between"}>
        <div className={"maxw-mobile-lg margin-bottom-2"}>
          <Heading level={2}>{props.headingText}</Heading>
        </div>
        <div className="margin-left-2">
          <UnStyledButton
            onClick={props.editHandleButtonClick}
            isUnderline
            dataTestid={props.dataTestId}
            ariaLabel={`${Config.formation.general.editButtonText} ${props.headingText}`}
          >
            {Config.formation.general.editButtonText}
          </UnStyledButton>
        </div>
      </div>
      {props.children}
      {!props.disableHorizontalLine && <hr className="margin-y-205" />}
    </>
  );
};
