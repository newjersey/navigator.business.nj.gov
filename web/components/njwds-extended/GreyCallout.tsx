import { ReactElement, ReactNode } from "react";

interface Props {
  children: ReactNode;
  link?: Link;
}

interface Link {
  text: string;
  href: string;
}

export const GreyCallout = (props: Props): ReactElement => {
  return (
    <div className="margin-top-3 text-sm fdr padding-3 bg-base-lightest border-base-lighter border-1px">
      <div>{props.children}</div>
      {props.link && (
        <div className="mla">
          <a href={props.link.href}>{props.link.text}</a>
        </div>
      )}
    </div>
  );
};
