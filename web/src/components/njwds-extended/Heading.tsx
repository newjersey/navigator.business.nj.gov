import { ReactElement } from "react";

type HeadingLevel = 0 | 1 | 2 | 3 | 4;
type HeadingStyleVariant = "h1" | "h1Large" | "h2" | "h3" | "h4" | "h5" | "h6" | "rawElement";

type HeadingStyles = {
  [variant in HeadingStyleVariant]: string;
};

const variantClasses: HeadingStyles = {
  h1: "h1-styling",
  h1Large: "h1-styling-large",
  h2: "h2-styling",
  h3: "h3-styling",
  h4: "h4-styling",
  h5: "h5-styling",
  h6: "h6-styling",
  rawElement: "",
};

const determineClassNames = (
  level: HeadingLevel,
  styleVariant?: HeadingStyleVariant | undefined,
  className?: string | undefined
): string => {
  const classStrings = [];
  let styleClass: string;

  switch (level) {
    case 1:
      styleClass = variantClasses["h1"];
      break;
    case 2:
      styleClass = variantClasses["h2"];
      break;
    case 3:
      styleClass = variantClasses["h3"];
      break;
    case 4:
      styleClass = variantClasses["h4"];
      break;
    default:
      styleClass = variantClasses["rawElement"];
      break;
  }

  if (styleVariant) {
    styleClass = variantClasses[styleVariant];
  }

  if (styleClass.length > 0) {
    classStrings.push(styleClass);
  }

  if (className) {
    classStrings.push(className);
  }

  const concatenatedClassList = classStrings.join(" ");

  return concatenatedClassList;
};

interface Props extends React.HTMLProps<HTMLHeadingElement> {
  level: HeadingLevel;
  styleVariant?: HeadingStyleVariant | undefined;
}

export const Heading: React.FC<Props> = (props) => {
  let headingElement: ReactElement<any>;
  const { level, styleVariant, children, className, ...defaultProps } = props;
  const classList = determineClassNames(level, styleVariant, className);

  switch (level) {
    case 1:
      headingElement = (
        <h1 {...defaultProps} className={classList}>
          {children}
        </h1>
      );
      break;
    case 2:
      headingElement = (
        <h2 {...defaultProps} className={classList}>
          {children}
        </h2>
      );
      break;
    case 3:
      headingElement = (
        <h3 {...defaultProps} className={classList}>
          {children}
        </h3>
      );
      break;
    case 4:
      headingElement = (
        <h4 {...defaultProps} className={classList}>
          {children}
        </h4>
      );
      break;
    default:
      headingElement = (
        <div {...defaultProps} className={classList}>
          {children}
        </div>
      );
      break;
  }

  return headingElement;
};
