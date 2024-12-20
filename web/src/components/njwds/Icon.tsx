import { ReactElement } from "react";

interface Props {
  iconName: string;
  className?: string;
  label?: string;
  "data-testid"?: string;
}

export const Icon = (props: Props): ReactElement<any> => {
  return (
    <svg
      className={`usa-icon ${props.className ?? ""}`}
      aria-label={props.label}
      aria-hidden="true"
      focusable="false"
      role="img"
      data-testid={props["data-testid"]}
      dangerouslySetInnerHTML={{
        __html: `<use xlink:href="/vendor/img/sprite.svg#${props.iconName}"></use>`,
      }}
    />
  );
};
