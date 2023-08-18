import { ReactElement, ReactNode } from "react";

interface Props {
  variant: AlertVariant;
  children: ReactNode;
  noIcon?: boolean;
  heading?: string;
  rounded?: boolean;
  dataTestid?: string;
  className?: string;
  borderRight?: boolean;
  borderSmall?: boolean;
}

export type AlertVariant = "info" | "success" | "warning" | "error" | "note";

export const Alert = (props: Props): ReactElement => {
  const { variant, children, noIcon, heading, rounded, dataTestid } = props;
  const variantClass = variant ? `usa-alert--${variant}` : "";
  const noIconClass = noIcon ? " usa-alert--no-icon" : "";
  const roundedClass = rounded ? " radius-md" : "";
  const alertRole = variant === "error" ? { role: "alert" } : {};
  const defaultClassNames = "usa-alert margin-y-2 usa-alert--slim";
  const borderRight = props.borderRight ? "alert-border-right" : "";
  const borderSmall = props.borderSmall ? "alert-border-small" : "";
  const className = [
    defaultClassNames,
    roundedClass,
    variantClass,
    borderRight,
    borderSmall,
    noIconClass,
    props.className ?? ""
  ]
    .map((i) => {
      return i?.trim();
    })
    .filter((value: string | undefined) => {
      return value && value.length > 0;
    })
    .join(" ");

  return (
    <div className={className} {...alertRole} {...(dataTestid ? { "data-testid": dataTestid } : {})}>
      <div className="usa-alert__body">
        {heading && <h3 className="margin-bottom-0">{heading}</h3>}
        <div className="usa-alert__text">{children}</div>
      </div>
    </div>
  );
};
