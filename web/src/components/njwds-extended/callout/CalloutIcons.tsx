import { IconTextProps } from "@/components/njwds-extended/callout/calloutHelpers";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import type { ReactElement, ReactNode } from "react";

interface IconTextListProps {
  items?: IconTextProps[];
}

const IconTextItem = (props: IconTextProps): ReactElement => {
  const { Config } = useConfig();

  let content: ReactNode;

  switch (props.type) {
    case "phone":
      content = (
        <>
          {props.labelText && <span className="margin-right-05">{props.labelText}</span>}
          <a className="usa-link" href={`tel:${props.text}`}>
            {props.text}
          </a>
        </>
      );
      break;
    case "email":
      content = (
        <a className="usa-link" href={`mailto:${props.text}`}>
          {props.text}
        </a>
      );
      break;
    case "link": {
      const match = props.text.match(/\[([^\]]+)]\(([^)]+)\)/);
      const label = match?.[1] || props.text;
      const href = match?.[2] || props.text;

      content = (
        <a className="usa-link" href={href} target="_blank" rel="noreferrer noopener">
          {label}
          <Icon className="margin-left-05" iconName="launch" />
        </a>
      );
      break;
    }
    default:
      content = <div className="text-primary-darker">{props.text}</div>;
  }

  const ariaLabel =
    Config.calloutDefaults[props.label as keyof typeof Config.calloutDefaults] || "";

  return (
    <div className="margin-top-2 margin-left-1 flex flex-align-center">
      <Icon className="margin-right-1 callout-icon" iconName={props.iconName} label={ariaLabel} />
      {content}
    </div>
  );
};

export const IconTextList = (props: IconTextListProps): ReactElement | null => {
  if (!props.items || props.items.length === 0) return null;

  return (
    <div className="margin-top-2">
      {props.items.map((item, index) => (
        <IconTextItem
          key={index}
          iconName={item.iconName}
          text={item.text}
          type={item.type}
          label={item.label}
          labelText={item.labelText}
        />
      ))}
    </div>
  );
};
