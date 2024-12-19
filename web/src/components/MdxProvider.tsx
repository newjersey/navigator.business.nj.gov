import { Callout, CalloutTypes } from "@/components/Callout";
import { CannabisLocationAlert } from "@/components/CannabisLocationAlert";
import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { InlineIconType } from "@/lib/cms/types";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { MDXProvider as BaseMDXProvider } from "@mdx-js/react";
import { FormControlLabel } from "@mui/material";
import type { ComponentType, ReactElement, ReactNode } from "react";

// Define the MDX component types
type MDXComponents = {
  [key: string]: ComponentType<any>;
};

interface MDXProviderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (url?: string) => void;
  customComponents?: Record<string, React.ReactElement>;
}

export const ExternalLink = ({
  children,
  href,
  onClick,
}: {
  children: string;
  href: string;
  onClick?: (url?: string) => void;
}): ReactElement => {
  return (
    <a
      className="usa-link"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      onClick={(): void => {
        onClick ? onClick(href) : analytics.event.external_link.click.open_external_website(children, href);
      }}
    >
      {children}
      <Icon iconName="launch" />
    </a>
  );
};

const Link = (onClick?: (url?: string) => void) => {
  function LinkComponent({ href, children }: { href: string; children: string }): ReactElement {
    if (/^https?:\/\/(.*)/.test(href)) {
      return (
        <ExternalLink href={href} onClick={() => onClick?.(href)}>
          {children}
        </ExternalLink>
      );
    }
    return (
      <a href={href} className="usa-link" onClick={() => onClick?.(href)}>
        {children}
      </a>
    );
  }

  return LinkComponent;
};

const Unformatted = (props: { children: React.ReactNode }): ReactElement => {
  return <div>{props.children}</div>;
};

const OutlineBox = (props: { children: React.ReactNode }): ReactElement => {
  return (
    <div className="text-normal padding-2 margin-top-2 border-base-lighter border-1px font-body-2xs">
      {props.children}
    </div>
  );
};

const ListOrCheckbox = (props: { children: string[] }): ReactElement => {
  if (props.children && typeof props.children[0] === "string" && props.children[0].startsWith("[]")) {
    const checklistItemId = props.children[0].slice("[]".length).split("{")[1].split("}")[0];
    const checklistItemBody = [props.children[0].split("}")[1], ...props.children.slice(1)];

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

const InlineIcon = (props: { type: InlineIconType; children: React.ReactNode }): ReactElement => {
  const getIconByType = (): ReactElement => {
    switch (props.type) {
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

export const MDXProvider = ({
  children,
  onClick,
  className = "",
  style,
  customComponents = {},
}: MDXProviderProps): ReactElement => {
  const { business } = useUserData();
  const isTest = process.env.NODE_ENV === "test";

  const components: MDXComponents = {
    code: isTest
      ? ({ children }: { children: string }): ReactElement => <>{`\`${children}\``}</>
      : ContextualInfoLink,
    a: Link(onClick),
    h2: (props: { children: ReactNode }): ReactElement => (
      <Heading level={2} styleVariant="h3" style={{ marginTop: "1rem" }}>
        {props.children}
      </Heading>
    ),
    h5: (props: { children: ReactNode }): ReactElement => <div className="h5-styling">{props.children}</div>,
    h6: (props: { children: ReactNode }): ReactElement => <div className="h6-styling">{props.children}</div>,
    hr: (): ReactElement => <HorizontalLine />,
    note: ({ children, heading }: { children: ReactNode; heading?: string }): ReactElement => (
      <Alert variant="note" heading={heading}>
        {children}
      </Alert>
    ),
    callout: (props: {
      children: ReactNode;
      showHeader?: boolean;
      headerText?: string;
      showIcon?: boolean;
      calloutType: CalloutTypes;
    }): ReactElement => (
      <Callout
        showHeader={props.showHeader}
        headerText={props.headerText}
        showIcon={props.showIcon}
        calloutType={props.calloutType}
      >
        {props.children}
      </Callout>
    ),
    infoAlert: ({ children }: { children: ReactNode }): ReactElement => (
      <Alert variant="info">{children}</Alert>
    ),
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
    del: (delProps: { children: string }): ReactElement => {
      return customComponents ? customComponents[delProps.children] : <>{delProps.children}</>;
    },
  };

  return (
    <BaseMDXProvider components={components}>
      <div className={`usa-prose ${className}`} style={style}>
        {children}
      </div>
    </BaseMDXProvider>
  );
};
