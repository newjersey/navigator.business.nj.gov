import React, { ReactElement } from "react";
import remark from "remark";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import remark2react from "remark-react";
import { ContextualInfoLink } from "./ContextualInfoLink";
import { Icon } from "./njwds/Icon";

interface Props {
  children: string;
}

export const Content = (props: Props): ReactElement => {
  const markdown = remark()
    .use(remark2react, {
      remarkReactComponents: {
        code: ContextualInfoLink,
        a: ExternalLink,
        table: OutlineBox,
        thead: Unformatted,
        tr: Unformatted,
        th: Unformatted,
        td: Unformatted,
        tbody: Unformatted,
      },
    })
    .processSync(props.children).result as ReactElement;

  return <div className="usa-prose">{markdown}</div>;
};

const ExternalLink = ({ children, href }: { children: string[]; href: string }): ReactElement => {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children[0]}
      <Icon className="">launch</Icon>
    </a>
  );
};

const Unformatted = ({ children }: { children: string[] }): ReactElement => <div>{children}</div>;

const OutlineBox = ({ children }: { children: string[] }): ReactElement => {
  return (
    <div className="text-normal padding-2 margin-top-2 border-base-lighter border-1px font-body-2xs">
      {children}
    </div>
  );
};
