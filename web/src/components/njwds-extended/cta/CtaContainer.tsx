import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  noBackgroundColor?: boolean;
  className?: string;
}

export const CtaContainer = (props: Props): ReactElement => {
  return (
    <div
      className={`cta-container${props.noBackgroundColor ? " no-background-color " : " "}${props.className}`}
      data-testid="cta-area"
    >
      {props.children}
    </div>
  );
};
