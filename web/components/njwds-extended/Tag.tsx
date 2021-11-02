import { ReactElement } from "react";

type TagVariant = "primary" | "base" | "info" | "error" | "accent-warm" | "noBgColor" | "noBgColorWithBorder";

interface Props {
  tagVariant: TagVariant;
  children: React.ReactNode;
  className?: string;
  dataTestid?: string;
  textWrap?: boolean;
}

export const Tag = (props: Props): ReactElement => {
  let styling = "";

  switch (props.tagVariant) {
    case "primary":
      styling = "bg-primary-lighter text-primary-dark";
      break;
    case "base":
      styling = "bg-base-lighter text-base-dark";
      break;
    case "info":
      styling = "bg-info-lighter text-info-darker";
      break;
    case "error":
      styling = "bg-error-lighter text-error-dark";
      break;
    case "accent-warm":
      styling = "bg-accent-warm-lighter text-accent-warm-darker";
      break;
    case "noBgColor":
      styling = "bg-white text-base";
      break;
    case "noBgColorWithBorder":
      styling = "bg-white text-base-dark border";
      break;
  }

  return (
    <span
      className={`usa-tag font-sans-2xs padding-y-05 ${
        props.textWrap ? "text-wrap" : "text-no-wrap"
      } ${styling} ${props.className || ""} `}
      {...(props.dataTestid ? { "data-testid": props.dataTestid } : {})}
    >
      {props.children}
    </span>
  );
};
