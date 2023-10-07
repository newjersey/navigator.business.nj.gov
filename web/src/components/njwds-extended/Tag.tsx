import { ReactElement } from "react";

export type BgColors =
  | "primary-lightest"
  | "base-lighter"
  | "accent-cool-lighter"
  | "accent-warm-lighter"
  | "white"
  | "accent-cooler-lightest"
  | "accent-cool-light"
  | "accent-semi-cool-light"
  | "accent-warm-extra-light";

interface Props {
  backgroundColor: BgColors;
  className?: string;
  children: React.ReactNode;
  dataTestid?: string;
  isFixedWidth?: boolean;
  isHover?: boolean;
  isLowerCase?: boolean;
  isRadiusMd?: boolean;
  isWrappingText?: boolean;
  isSmallerVerticalPadding?: boolean;
}

export const Tag = (props: Props): ReactElement => {
  let styling = "";
  let hoverStyling = "";

  switch (props.backgroundColor) {
    case "primary-lightest":
      styling = "bg-primary-lightest text-primary-dark";
      break;
    case "base-lighter":
      styling = "bg-base-lighter text-base-dark";
      break;
    case "accent-cool-lighter":
      styling = "bg-accent-cool-lighter text-accent-cool-darker";
      break;
    case "accent-warm-lighter":
      styling = "bg-accent-warm-lighter text-accent-warm-darker";
      break;
    case "white":
      styling = "bg-white text-base-dark border";
      break;
    case "accent-cool-light":
      styling = "bg-white text-base-darkest bg-accent-cool-light";
      break;
    case "accent-semi-cool-light":
      styling = "bg-white text-base-darkest bg-accent-semi-cool-light";
      break;
    case "accent-warm-extra-light":
      styling = "bg-accent-warm-extra-light text-base-dark";
      break;
    case "accent-cooler-lightest":
      styling = "bg-accent-cooler-lightest text-base-darkest border border-accent-cooler-light";
      break;
  }

  switch (props.isHover) {
    case props.backgroundColor === "accent-warm-extra-light":
      hoverStyling = "bg-accent-warm-lighter-on-hover";
      break;
  }

  const defaultStyle =
    "flex flex-align-center flex-justify usa-tag font-sans-2xs width-full width-auto line-height-sans-2";
  const textWrap = props.isWrappingText ? "text-wrap display-block" : "text-no-wrap";
  const fixedWidth = props.isFixedWidth ? "tag-fixed-width" : "";
  const disableUppercase = props.isLowerCase ? "text-no-uppercase" : "";
  const radius = props.isRadiusMd ? "radius-md" : "";
  const verticalPadding = props.isSmallerVerticalPadding ? "padding-y-2px" : "padding-y-05";

  const className = [
    defaultStyle,
    styling,
    hoverStyling,
    textWrap,
    fixedWidth,
    disableUppercase,
    radius,
    verticalPadding,
    props.className,
  ]
    .map((i) => {
      return i?.trim();
    })
    .filter((value: string | undefined) => {
      return value && value.length > 0;
    })
    .join(" ");

  return (
    <span className={className} {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}>
      {props.children}
    </span>
  );
};
