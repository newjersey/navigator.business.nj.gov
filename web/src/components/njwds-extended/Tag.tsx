import React, { ReactElement } from "react";

export type TagVariant =
  | "base"
  | "completed"
  | "notStarted"
  | "inProgress"
  | "accent"
  | "baseDark"
  | "baseDarkest"
  | "certification"
  | "funding"
  | "annual";

interface Props {
  tagVariant: TagVariant;
  children: React.ReactNode;
  dataTestid?: string;
  textWrap?: boolean;
  bold?: boolean;
  className?: string;
  hover?: boolean;
  fixedWidth?: boolean;
  disableUppercase?: boolean;
}

export const Tag = (props: Props): ReactElement => {
  let styling = "";
  let hoverStyling = "";

  switch (props.tagVariant) {
    case "completed":
      styling = "bg-primary-lightest text-primary-dark";
      break;
    case "notStarted":
    case "base":
      styling = "bg-base-lighter text-base-dark";
      break;
    case "inProgress":
      styling = "bg-accent-cool-lighter text-accent-cool-darker";
      break;
    case "accent":
      styling = "bg-accent-warm-lighter text-accent-warm-darker";
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
    case "annual":
      styling = "bg-warning-light text-base-dark";
      break;
  }

  switch (props.hover) {
    case props.tagVariant === "annual":
      hoverStyling = "warning-extra-light-hover-override";
      break;
  }

  const defaultStyle =
    "flex flex-align-center flex-justify usa-tag font-sans-2xs width-full width-auto line-height-sans-2 padding-y-2px";
  const textWrap = props.textWrap ? "text-wrap display-block" : "text-no-wrap";
  const textBold = props.bold ? "text-bold" : "";
  const fixedWidth = props.fixedWidth ? "tag-fixed-width display-inline-block" : "";
  const disableUppercase = props.disableUppercase ? "text-no-uppercase" : "";

  const className = [
    defaultStyle,
    props.className,
    styling,
    hoverStyling,
    textWrap,
    fixedWidth,
    disableUppercase,
    textBold,
  ]
    .map((i) => i?.trim())
    .filter((value: string | undefined) => value && value.length > 0)
    .join(" ");

  return (
    <span className={className} {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}>
      {props.children}
    </span>
  );
};
