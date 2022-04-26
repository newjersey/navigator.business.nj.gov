/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { Icon } from "@/components/njwds/Icon";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import analytics from "@/lib/utils/analytics";
import { FormControlLabel } from "@mui/material";
import React, { CSSProperties, ReactElement } from "react";
import rehypeReact from "rehype-react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

interface ContentProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
  onClick?: () => void;
}

export const Content = (props: ContentProps): ReactElement => {
  return (
    <div className={`usa-prose ${props.className ?? ""}`} style={props.style}>
      <ContentNonProse overrides={props.overrides} onClick={props.onClick}>
        {props.children}
      </ContentNonProse>
    </div>
  );
};

interface ContentNonProseProps {
  children: string;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
  onClick?: () => void;
}

export const ContentNonProse = (props: ContentNonProseProps): ReactElement => {
  const markdown = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: {
        code: ContextualInfoLink,
        a: Link(props.onClick),
        h5: (props: any) => <div className="h5-styling">{props.children}</div>,
        h6: (props: any) => <div className="h6-styling">{props.children}</div>,
        blockquote: GreenBox,
        table: OutlineBox,
        li: ListOrCheckbox,
        thead: Unformatted,
        tr: Unformatted,
        th: Unformatted,
        td: Unformatted,
        tbody: Unformatted,
        ...props.overrides,
      },
    })
    .processSync(props.children).result;
  return <>{markdown}</>;
};

const Link = (onClick?: () => void) =>
  Object.assign(
    (props: any): ReactElement => {
      if (/^https?:\/\/(.*)/.test(props.href)) {
        return (
          <ExternalLink href={props.href} onClick={onClick}>
            {props.children}
          </ExternalLink>
        );
      }
      return (
        <a href={props.href} onClick={onClick}>
          {props.children[0]}
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

const Unformatted = (props: any): ReactElement => <div>{props.children}</div>;

const OutlineBox = (props: any): ReactElement => {
  return (
    <div className="text-normal padding-2 margin-top-2 border-base-lighter border-1px font-body-2xs">
      {props.children}
    </div>
  );
};

const GreenBox = (props: any): ReactElement => {
  return (
    <div className="green-box text-normal padding-2 margin-top-2 bg-success-lighter radius-lg">
      {props.children}
    </div>
  );
};

const ListOrCheckbox = (props: any): ReactElement => {
  if (typeof props.children[0] === "string" && props.children[0].startsWith("[]")) {
    const checklistItemId = props.children[0].slice("[]".length).split("{")[1].split("}")[0];
    const checklistItemBody = [props.children[0].split("}")[1], ...props.children.slice(1)];

    return (
      <div className="margin-y-2">
        <FormControlLabel
          label={<>{checklistItemBody}</>}
          control={
            <TaskCheckbox
              checklistItemId={checklistItemId}
              checkboxProps={{
                sx: { alignSelf: "start", paddingTop: "1px", paddingBottom: "0px" },
              }}
            />
          }
        />
      </div>
    );
  }
  return <li>{props.children}</li>;
};
