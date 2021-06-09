import { ReactElement, ReactNode } from "react";

interface Props {
  variant?: AlertVariant;
  children: ReactNode;
  slim?: boolean;
  noIcon?: boolean;
  className?: string;
  // All other props
  [x: string]: unknown;
}

type AlertVariant = "info" | "success" | "warning" | "error";

export const Alert = (props: Props): ReactElement => {
  const { variant, children, slim, noIcon, className, ...rest } = props;
  const variantClass = `usa-alert--${variant}` || "";
  const slimClass = slim ? "usa-alert--slim" : "";
  const noIconClass = noIcon ? "usa-alert--no-icon" : "";

  return (
    <div className={`usa-alert ${variantClass} ${slimClass} ${noIconClass} ${className || ""}`} {...rest}>
      <div className="usa-alert__body">
        <div className="usa-alert__text">{children}</div>
      </div>
    </div>
  );
};
