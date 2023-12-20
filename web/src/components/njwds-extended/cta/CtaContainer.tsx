import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export const CtaContainer = (props: Props): ReactElement => {
  return (
    <div
      className="bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 padding-right-4 margin-bottom-neg-4 radius-bottom-lg"
      data-testid="cta-area"
    >
      {props.children}
    </div>
  );
};
