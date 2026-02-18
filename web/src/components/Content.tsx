/* eslint-disable @typescript-eslint/no-explicit-any */

import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { HorizontalLine } from "@/components/HorizontalLine";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { LargeCallout } from "@/components/njwds-extended/callout/LargeCallout";
import { MiniCallout } from "@/components/njwds-extended/callout/MiniCallout";
import { Icon } from "@/components/njwds/Icon";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { InlineIconType } from "@/lib/cms/types";
import { useContentModifiedByUserData } from "@/lib/data-hooks/useContentModifiedByUserData";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { FormControlLabel } from "@mui/material";
import { CSSProperties, type ReactElement, type ReactNode } from "react";

interface ContentProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
  onClick?: (url?: string) => void;
  customComponents?: Record<string, ReactElement>;
  showLaunchIcon?: boolean;
}

export const Content = (props: ContentProps): ReactNode => {
  const { business } = useUserData();
  const updatedContent = useContentModifiedByUserData(props.children);

  const isTest = process.env.NODE_ENV === "test";

  const components = {
    code: isTest
      ? (props: any): ReactElement => {
          return <>{`\`${props.children}\``}</>;
        }
      : ContextualInfoLink,
    a: Link(props.onClick, props.showLaunchIcon ?? true),
    h2: (props: any): ReactElement => {
      return (
        <Heading level={2} style={{ marginTop: "1rem" }}>
          {props.children}
        </Heading>
      );
    },
    h5: (props: any): ReactElement => {
      return <div className="h5-styling">{props.children}</div>;
    },
    h6: (props: any): ReactElement => {
      return <div className="h6-styling">{props.children}</div>;
    },
    hr: (): ReactElement => {
      return <HorizontalLine />;
    },
    note: (props: any): ReactElement => {
      return <Alert variant="note">{props.children}</Alert>;
    },
    largeCallout: (props: any): ReactElement => {
      return (
        <LargeCallout
          showHeader={props.showHeader}
          headerText={props.headerText}
          calloutType={props.calloutType}
          amountIconText={props.amountIconText}
          filingTypeIconText={props.filingTypeIconText}
          frequencyIconText={props.frequencyIconText}
          phoneIconText={props.phoneIconText}
          emailIconText={props.emailIconText}
        >
          {props.children}
        </LargeCallout>
      );
    },
    miniCallout: (props: any): ReactElement => {
      return <MiniCallout calloutType={props.calloutType}>{props.children}</MiniCallout>;
    },
    infoAlert: (props: any): ReactElement => {
      return <Alert variant="info">{props.children}</Alert>;
    },
    cannabisLocationAlert: (): ReactElement => (
      <CannabisLocationAlert industryId={business?.profileData.industryId} />
    ),
    icon: InlineIcon,
    table: OutlineBox,
    li: ListOrCheckbox,
    thead: Unformatted,
    tr: Unformatted,
    th: Unformatted,
    td: Unformatted,
    tbody: Unformatted,
    del: (delProps: any): ReactElement => {
      return props.customComponents ? props.customComponents[delProps.children] : delProps.children;
    },
    ...props.overrides,
  };

  return (
    <div className={`usa-prose ${props.className ?? ""}`} style={props.style}>
      <PureMarkdownContent components={components}>{updatedContent}</PureMarkdownContent>
    </div>
  );
};

const Link = (onClick?: (url?: string) => void, showLaunchIcon?: boolean): any => {
  return Object.assign(
    (props: any): ReactElement => {
      const childrenContent =
        props.children && Array.isArray(props.children) ? props.children[0] : props.children;

      if (!props.href) {
        return <>{childrenContent || ""}</>;
      }

      const linkText = childrenContent || props.href;

      if (/^https?:\/\/(.*)/.test(props.href)) {
        return (
          <ExternalLink
            href={props.href}
            id={props.title}
            onClick={(): void => onClick && onClick(props.href)}
            showLaunchIcon={showLaunchIcon}
          >
            {linkText}
          </ExternalLink>
        );
      }
      return (
        <a
          href={props.href}
          className="usa-link"
          onClick={(): void => (onClick ? onClick(props.href) : undefined)}
        >
          {linkText}
        </a>
      );
    },
    { displayName: "Link" },
  );
};

export const ExternalLink = ({
  children,
  href,
  onClick,
  id,
  showLaunchIcon = true,
}: {
  children: string;
  href: string;
  onClick?: (url?: string) => void;
  id?: string;
  showLaunchIcon?: boolean;
}): ReactElement => {
  return (
    <a
      className="usa-link"
      id={id}
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(): void => {
        onClick
          ? onClick(href)
          : analytics.event.external_link.click.open_external_website(children, href);
      }}
    >
      {children}
      {showLaunchIcon && <Icon iconName="launch" />}
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

const ListOrCheckbox = (props: any): ReactElement => {
  // React 19 compatibility: normalize children to array
  const childrenArray = Array.isArray(props.children) ? props.children : [props.children];
  const firstChild = childrenArray[0];

  if (firstChild && typeof firstChild === "string" && firstChild.startsWith("[]")) {
    const checklistItemId = firstChild.slice("[]".length).split("{")[1].split("}")[0];
    const checklistItemBody = [firstChild.split("}")[1], ...childrenArray.slice(1)];

    return (
      <div>
        <FormControlLabel
          label={checklistItemBody}
          control={<TaskCheckbox checklistItemId={checklistItemId} />}
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
        return <Icon className="inline-icon text-green" iconName="check_circle" />;
      case "red x mark":
        return <Icon className="inline-icon text-red" iconName="cancel" />;
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
