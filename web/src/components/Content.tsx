import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { Icon } from "@/components/njwds/Icon";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import analytics from "@/lib/utils/analytics";
import { FormControlLabel } from "@mui/material";
import React, { CSSProperties, ReactElement } from "react";
import remark from "remark";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import remark2react from "remark-react";

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
  const markdown = remark()
    .use(remark2react, {
      remarkReactComponents: {
        code: ContextualInfoLink,
        a: Link(props.onClick),
        h5: ({ children }: { children: string[] }) => <div className="h5-styling">{children}</div>,
        h6: ({ children }: { children: string[] }) => <div className="h6-styling">{children}</div>,
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

const GreenBox = ({ children }: { children: string[] }): ReactElement => {
  return (
    <div className="green-box text-normal padding-2 margin-top-2 bg-success-lighter radius-lg">
      {children}
    </div>
  );
};

const ListOrCheckbox = ({ children }: { children: unknown[] }): ReactElement => {
  if (typeof children[0] === "string" && children[0].startsWith("[]")) {
    const checklistItemId = children[0].slice("[]".length).split("{")[1].split("}")[0];
    const checklistItemBody = [children[0].split("}")[1].trim(), ...children.slice(1)];
    return (
      <div>
        <FormControlLabel
          label={<>{checklistItemBody}</>}
          control={<TaskCheckbox checklistItemId={checklistItemId} />}
        />
      </div>
    );
  }
  return <li>{children}</li>;
};
