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
    <div className="margin-top-3 font-body-2xs fdr padding-3 bg-base-lightest border-base-lighter border-1px">
      <div>{props.children}</div>
      {props.link && (
        <div className="mla font-body-sm">
          <a href={props.link.href} data-grey-callout-link={true}>
            {props.link.text}
          </a>
        </div>
      )}
    </div>
  );
};
