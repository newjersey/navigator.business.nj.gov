import React, { ReactElement } from "react";

interface Props {
  children: string;
  className?: string;
  label?: string;
}

export const Icon = (props: Props): ReactElement => {
  return (
    <svg
      className={`usa-icon ${props.className ? props.className : ""}`}
      aria-label={props.label}
      aria-hidden="true"
      focusable="false"
      role="img"
      dangerouslySetInnerHTML={{
        __html: `<use xlink:href="/vendor/img/sprite.svg#${props.children}"></use>`,
      }}
    />
  );
};
