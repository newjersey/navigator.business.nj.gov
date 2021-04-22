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
  return remark()
    .use(remark2react, {
      remarkReactComponents: {
        code: ContextualInfoLink,
        a: ExternalLink,
      },
    })
    .processSync(props.children).result as ReactElement;
};

const ExternalLink = ({ children, href }: { children: string[]; href: string }): ReactElement => {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children[0]}
      <Icon className="">launch</Icon>
    </a>
  );
};
