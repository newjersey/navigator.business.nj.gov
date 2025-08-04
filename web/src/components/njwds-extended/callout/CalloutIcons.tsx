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

  if (props.type === "phone") {
    content = (
      <a className="usa-link" href={`tel:${props.text}`}>
        {props.text}
      </a>
    );
  } else if (props.type === "email") {
    content = (
      <a className="usa-link" href={`mailto:${props.text}`}>
        {props.text}
      </a>
    );
  } else {
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
        />
      ))}
    </div>
  );
};
