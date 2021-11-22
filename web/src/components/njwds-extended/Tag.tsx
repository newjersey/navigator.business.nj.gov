import React, { ReactElement } from "react";

type TagVariant = "primary" | "base" | "info" | "error" | "accent" | "noBg" | "baseDark";

interface Props {
  tagVariant: TagVariant;
  children: React.ReactNode;
  dataTestid?: string;
  textWrap?: boolean;
  bold?: boolean;
  hover?: boolean;
  fixedWidth?: boolean;
}

export const Tag = (props: Props): ReactElement => {
  let styling = "";
  let hoverStyling = "";

  switch (props.tagVariant) {
    case "primary":
      styling = " bg-primary-lighter text-primary-dark";
      break;
    case "base":
      styling = " bg-base-lighter text-base-dark";
      break;
    case "info":
      styling = " bg-info-lighter text-info-darker";
      break;
    case "error":
      styling = " bg-error-lighter text-error-dark";
      break;
    case "accent":
      styling = " bg-accent-warm-lighter text-accent-warm-darker";
      break;
    case "noBg":
      styling = " bg-white text-base";
      break;
    case "baseDark":
      styling = " bg-white text-base-dark border usa-tag-padding-override";
      break;
  }

  switch (props.hover) {
    case props.tagVariant === "info":
      hoverStyling = " accent-cool-hover-override";
      break;
  }

  return (
    <span
      className={`usa-tag font-sans-2xs padding-y-2px width-full width-auto line-height-sans-2${
        props.textWrap ? " text-wrap display-block" : " text-no-wrap"
      }${styling}${hoverStyling}${props.bold ? " text-bold" : ""}${
        props.fixedWidth ? " tag-fixed-width display-inline-block" : ""
      }`}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
    >
      {props.children}
    </span>
  );
};
