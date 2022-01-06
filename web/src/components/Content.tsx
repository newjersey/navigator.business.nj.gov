import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { Icon } from "@/components/njwds/Icon";
import analytics from "@/lib/utils/analytics";
import React, { ReactElement } from "react";
import remark from "remark";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import remark2react from "remark-react";

interface Props {
  children: string;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
  onClick?: () => void;
}

export const Content = (props: Props): ReactElement => {
  return (
    <div className="usa-prose">
      <ContentNonProse overrides={props.overrides} onClick={props.onClick}>
        {props.children}
      </ContentNonProse>
    </div>
  );
};

export const ContentNonProse = (props: Props): ReactElement => {
  const markdown = remark()
    .use(remark2react, {
      remarkReactComponents: {
        code: ContextualInfoLink,
        a: Link(props.onClick),
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

  return <>{markdown}</>;
};

const Link = (onClick?: () => void) =>
  Object.assign(
    ({ children, href }: { children: string[]; href: string }): ReactElement => {
      if (/^https?:\/\/(.*)/.test(href)) {
        return (
          <ExternalLink href={href} onClick={onClick}>
            {children}
          </ExternalLink>
        );
      }
      return (
        <a href={href} onClick={onClick}>
          {children[0]}
        </a>
      );
    },
    { displayName: "Link" }
  );

const ExternalLink = ({
  children,
  href,
  onClick,
}: {
  children: string[];
  href: string;
  onClick?: () => void;
}): ReactElement => {
  return (
    <a
      className="usa-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={onClick ?? analytics.event.external_link.click.open_external_website}
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
