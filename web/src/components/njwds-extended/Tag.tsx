import { ReactElement } from "react";

export type BgColors =
  | "primary-lightest"
  | "base-lighter"
  | "accent-cool-lighter-border-darktext"
  | "accent-cool-lighter-lighttext"
  | "accent-warm-lighter"
  | "white"
  | "accent-cooler-lightest"
  | "accent-cool-light"
  | "accent-semi-cool-light"
  | "accent-warm-extra-light";

interface Props {
  backgroundColor: BgColors;
  children: React.ReactNode;
  dataTestid?: string;
  isFixedWidth?: boolean;
  isHover?: boolean;
  isLowerCase?: boolean;
  isRadiusMd?: boolean;
  isWrappingText?: boolean;
}

export const Tag = (props: Props): ReactElement<any> => {
  let styling = "";
  let hoverStyling = "";

  switch (props.backgroundColor) {
    case "primary-lightest":
      styling = "bg-primary-lightest text-primary-dark";
      break;
    case "base-lighter":
      styling = "bg-base-lighter text-base-dark";
      break;
    case "accent-cool-lighter-border-darktext":
      styling = "bg-accent-cool-lighter text-base-darkest border border-accent-cool";
      break;
    case "accent-cool-lighter-lighttext":
      styling = "bg-accent-cool-lighter text-base-darkest text-accent-cool-darker";
      break;
    case "accent-warm-lighter":
      styling = "bg-accent-warm-lighter text-accent-warm-darker";
      break;
    case "white":
      styling = "bg-white text-base border";
      break;
    case "accent-cool-light":
      styling = "bg-white text-base-darkest bg-accent-cool-light";
      break;
    case "accent-semi-cool-light":
      styling = "bg-white text-base-darkest bg-accent-semi-cool-light border border-accent-semi-cool-500";
      break;
    case "accent-warm-extra-light":
      styling = "bg-accent-warm-extra-light text-base-dark";
      break;
    case "accent-cooler-lightest":
      styling = "bg-accent-cooler-lightest text-base-darkest border border-accent-cooler-200";
      break;
  }

  switch (props.isHover) {
    case props.backgroundColor === "accent-warm-extra-light":
      hoverStyling = "bg-accent-warm-lighter-on-hover";
      break;
  }

  const defaultStyle =
    "flex flex-align-center flex-justify usa-tag font-sans-2xs width-full width-auto line-height-sans-2 padding-y-2px";
  const textWrap = props.isWrappingText ? "text-wrap display-block" : "text-no-wrap";
  const fixedWidth = props.isFixedWidth ? "tag-fixed-width" : "";
  const disableUppercase = props.isLowerCase ? "text-no-uppercase" : "";
  const radius = props.isRadiusMd ? "radius-md" : "";

  const className = [
    defaultStyle,
    styling,
    hoverStyling,
    textWrap,
    fixedWidth,
    disableUppercase,
    radius,
  ].reduce((accumulator, current) => {
    if (current.length === 0) {
      return accumulator;
    } else if (accumulator.length === 0) {
      return current.trim();
    }
    return [accumulator, current.trim()].join(" ");
  }, "");

  return (
    <span className={className} {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}>
      {props.children}
    </span>
  );
};
