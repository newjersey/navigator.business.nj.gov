import React, { ReactElement } from "react";
import remark from "remark";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import remark2react from "remark-react";
import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";

interface Props {
  children: string;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
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
        ...props.overrides,
      },
    })
    .processSync(props.children).result as ReactElement;

  return <div className="usa-prose">{markdown}</div>;
};

const ExternalLink = ({ children, href }: { children: string[]; href: string }): ReactElement => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={analytics.event.external_link.click.open_external_website}
    >
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
