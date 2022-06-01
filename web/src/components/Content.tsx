/* eslint-disable @typescript-eslint/no-explicit-any */

import { ContextualInfoLink } from "@/components/ContextualInfoLink";
import { Icon } from "@/components/njwds/Icon";
import { PureMarkdownContent } from "@/components/PureMarkdownContent";
import { TaskCheckbox } from "@/components/tasks/TaskCheckbox";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { FormControlLabel } from "@mui/material";
import { useRouter } from "next/router";
import { CSSProperties, ReactElement, useContext } from "react";

interface ContentProps {
  children: string;
  className?: string;
  style?: CSSProperties;
  overrides?: { [key: string]: { ({ children }: { children: string[] }): ReactElement } };
  onClick?: () => void;
}

export const Content = (props: ContentProps): ReactElement => {
  const components = {
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
  };

  return (
    <div className={`usa-prose ${props.className ?? ""}`} style={props.style}>
      <PureMarkdownContent components={components}>{props.children}</PureMarkdownContent>
    </div>
  );
};

const Link = (onClick?: () => void) => {
  const router = useRouter();
  const { userData, update } = useUserData();
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  return Object.assign(
    (props: any): ReactElement => {
      if (/^https?:\/\/(.*)/.test(props.href)) {
        return (
          <ExternalLink href={props.href} onClick={onClick}>
            {props.children}
          </ExternalLink>
        );
      } else if (props.href.startsWith("/self-register")) {
        return (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <a
            href="#"
            onClick={() => {
              parseAndSendAnalyticsEvent(props.href);
              onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
            }}
          >
            {props.children[0]}
          </a>
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
};

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

/* eslint-disable @typescript-eslint/ban-ts-comment */
const parseAndSendAnalyticsEvent = (href: string): void => {
  const urlParts = href.split("/self-register");
  if (urlParts.length === 2) {
    const secondHalfOfUrl = urlParts[1].slice(1);
    const possibleAnalyticsEvents = Object.keys(analytics.event);

    // @ts-ignore
    if (possibleAnalyticsEvents.includes(secondHalfOfUrl)) {
      // @ts-ignore
      if (Object.keys(analytics.event[secondHalfOfUrl]).includes("click")) {
        // @ts-ignore
        if (Object.keys(analytics.event[secondHalfOfUrl].click).includes("go_to_myNJ_registration")) {
          // @ts-ignore
          analytics.event[secondHalfOfUrl].click.go_to_myNJ_registration();
        }
      }
    }
  }
};
