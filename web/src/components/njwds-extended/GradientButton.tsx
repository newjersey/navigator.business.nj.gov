import { Icon } from "@/components/njwds/Icon";
import { ReactElement } from "react";

interface Props {
  text: string;
  ariaLabel?: string;
  dataTestid?: string;
  icon?: string;
  onClick?: () => void;
  role?: string;
}

export const GradientButton = (props: Props): ReactElement => {
  return (
    <button
      {...(props.ariaLabel ? { "aria-label": props.ariaLabel } : {})}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
      {...(props.role ? { role: props.role } : {})}
      className="gradient-button"
      onClick={props.onClick}
    >
      {props.icon && (
        <img src={`/img/${props.icon}.svg`} alt={`${props.icon} icon`} role="presentation" />
      )}
      <div className="gradient-button-text">{props.text}</div>
      <Icon className="usa-icon--size-4 text-base" iconName="navigate_next" />
    </button>
  );
};
