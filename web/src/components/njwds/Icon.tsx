import type { ReactElement } from "react";

interface Props {
  iconName: string;
  className?: string;
  label?: string;
  "data-testid"?: string;
  id?: string;
}

export const Icon = (props: Props): ReactElement => {
  return (
    <svg
      className={`usa-icon ${props.className ?? ""}`}
      aria-label={props.label}
      aria-hidden="true"
      focusable="false"
      role="img"
      data-testid={props["data-testid"]}
      id={props.id}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: every iconName caller passes a code-owned sprite id literal, never user or CMS input
      dangerouslySetInnerHTML={{
        __html: `<use xlink:href="/vendor/img/sprite.svg#${props.iconName}"></use>`,
      }}
    />
  );
};
