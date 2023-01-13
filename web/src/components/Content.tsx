/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { Alert } from "@/components/njwds-extended/Alert";
import { Icon } from "@/components/njwds/Icon";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { SelfRegLink } from "@/components/SelfRegLink";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { InlineIconType } from "@/lib/cms/types";
import analytics from "@/lib/utils/analytics";
import { FormControlLabel } from "@mui/material";
import { CSSProperties, ReactElement } from "react";

interface ContentProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
  onClick?: () => void;
  customComponents?: Record<string, ReactElement>;
}

export const Content = (props: ContentProps): ReactElement => {
  const isTest = process.env.NODE_ENV === "test";

  const components = {
    code: isTest
      ? (props: any) => {
          return <>`{props.children}`</>;
        }
      : ContextualInfoLink,
    a: Link(props.onClick),
    h5: (props: any) => {
      return <div className="h5-styling">{props.children}</div>;
    },
    h6: (props: any) => {
      return <div className="h6-styling">{props.children}</div>;
    },
    hr: () => {
      return <hr className="margin-y-3" />;
    },
    blockquote: GreenBox,
    infoAlert: (props: any) => {
      return (
        <Alert variant="info" heading={props.header}>
          {props.children}
        </Alert>
      );
    },
    icon: InlineIcon,
    table: OutlineBox,
    li: ListOrCheckbox,
    thead: Unformatted,
    tr: Unformatted,
    th: Unformatted,
    td: Unformatted,
    tbody: Unformatted,
    del: (delProps: any) => {
      return props.customComponents ? props.customComponents[delProps.children] : delProps.children;
    },
    ...props.overrides,
  };

  return (
    <div className={`usa-prose ${props.className ?? ""}`} style={props.style}>
      <PureMarkdownContent components={components}>{props.children}</PureMarkdownContent>
    </div>
  );
};

const Link = (onClick?: () => void) => {
  return Object.assign(
    (props: any): ReactElement => {
      if (/^https?:\/\/(.*)/.test(props.href)) {
        return (
          <ExternalLink href={props.href} onClick={onClick}>
            {props.children[0]}
          </ExternalLink>
        );
      } else if (props.href.startsWith("/self-register")) {
        return <SelfRegLink href={props.href}>{props.children}</SelfRegLink>;
      }
      return (
        <a href={props.href} onClick={onClick}>
          {props.children[0]}
        </a>
      );
    },
    { displayName: "Link" }
  );
};

export const ExternalLink = ({
  children,
  href,
  onClick,
}: {
  children: string;
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
      {children}
      <Icon className="">launch</Icon>
    </a>
  );
};

const Unformatted = (props: any): ReactElement => {
  return <div>{props.children}</div>;
};

const OutlineBox = (props: any): ReactElement => {
  return (
    <div className="text-normal padding-2 margin-top-2 border-base-lighter border-1px font-body-2xs">
      {props.children}
    </div>
  );
};

export const GreenBox = (props: any): ReactElement => {
  return (
    <div className="green-box text-normal padding-2 margin-top-2 bg-success-lighter radius-lg">
      {props.children}
    </div>
  );
};

const ListOrCheckbox = (props: any): ReactElement => {
  if (props.children && typeof props.children[0] === "string" && props.children[0].startsWith("[]")) {
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
                sx: {
                  alignSelf: "start",
                  paddingTop: "1px",
                  paddingBottom: "0px",
                  paddingLeft: "0px",
                },
              }}
            />
          }
        />
      </div>
    );
  }
  return <li>{props.children ?? ""}</li>;
};

const InlineIcon = (props: any): ReactElement => {
  const getIconByType = (): ReactElement => {
    switch (props.type as InlineIconType) {
      case "green checkmark":
        return <Icon className="inline-icon text-green">check_circle</Icon>;
      case "red x mark":
        return <Icon className="inline-icon text-red">cancel</Icon>;
      default:
        return <></>;
    }
  };

  return (
    <div className="margin-top-2">
      {getIconByType()}
      <div className="display-inline-block margin-left-1">{props.children}</div>
    </div>
  );
};
