import { ReactElement, ReactNode } from "react";

interface Props {
  variant?: AlertVariant;
  children: ReactNode;
  slim?: boolean;
  noIcon?: boolean;
  className?: string;
}

type AlertVariant = "info" | "success" | "warning" | "error";

export const Alert = (props: Props): ReactElement => {
  const variantClass = `usa-alert--${props.variant}` || "";
  const slimClass = props.slim ? "usa-alert--slim" : "";
  const noIconClass = props.noIcon ? "usa-alert--no-icon" : "";

  return (
    <div className={`usa-alert ${variantClass} ${slimClass} ${noIconClass} ${props.className || ""}`}>
      <div className="usa-alert__body usa-prose">{props.children}</div>
    </div>
  );
};
