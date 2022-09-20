import React, { ReactElement } from "react";

export type TagVariant =
  | "primary"
  | "base"
  | "info"
  | "error"
  | "accent"
  | "noBg"
  | "baseDark"
  | "baseDarkest"
  | "required"
  | "certification"
  | "funding"
  | "annual";

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
      styling = "bg-primary-lighter text-primary-dark";
      break;
    case "base":
      styling = "bg-base-lighter text-base-dark";
      break;
    case "info":
      styling = "bg-info-extra-light text-info-darker";
      break;
    case "error":
      styling = "bg-error-extra-light text-error-dark";
      break;
    case "accent":
      styling = "bg-accent-warm-lighter text-accent-warm-darker";
      break;
    case "noBg":
      styling = "bg-white text-base";
      break;
    case "baseDark":
      styling = "bg-white text-base-dark border usa-tag-padding-override";
      break;
    case "certification":
      styling = "bg-white text-base-darkest bg-certification";
      break;
    case "funding":
      styling = "bg-white text-base-darkest bg-funding";
      break;
    case "required":
      styling =
        "bg-white text-accent-cool-darker border-1px border-accent-cool-darker padding-y-0 padding-left-0";
      break;
    case "annual":
      styling = "bg-warning-light text-base-dark";
      break;
  }

  switch (props.hover) {
    case props.tagVariant === "info":
      hoverStyling = "accent-cool-hover-override";
      break;
    case props.tagVariant === "annual":
      hoverStyling = "warning-extra-light-hover-override";
      break;
  }

  return (
    <span
      className={`flex flex-align-center flex-justify usa-tag font-sans-2xs width-full width-auto line-height-sans-2 padding-y-2px
        ${props.textWrap ? "text-wrap display-block" : "text-no-wrap"}
        ${styling}
        ${hoverStyling}
        ${props.bold ? "text-bold" : ""}
        ${props.fixedWidth ? "tag-fixed-width display-inline-block" : ""}
      `}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
    >
      {props.children}
    </span>
  );
};
