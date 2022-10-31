import { AuthAlertContext } from "@/contexts/authAlertContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement, ReactNode, useContext } from "react";

interface Props {
  children: ReactNode[];
  href: string;
}

export const SelfRegLink = (props: Props): ReactElement => {
  const router = useRouter();
  const { userData, update } = useUserData();
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  const onClick = async () => {
    if (!userData) {
      return;
    }
    parseAndSendAnalyticsEvent(props.href);
    onSelfRegister(router, userData, update, setRegistrationAlertStatus);
  };

  /* eslint-disable @typescript-eslint/ban-ts-comment */
  const parseAndSendAnalyticsEvent = (href: string): void => {
    const urlParts = href.split("/self-register");
    if (urlParts.length === 2) {
      const secondHalfOfUrl = urlParts[1].slice(1);
      const possibleAnalyticsEvents = Object.keys(analytics.event);

      if (
        possibleAnalyticsEvents.includes(secondHalfOfUrl) && // @ts-ignore
        Object.keys(analytics.event[secondHalfOfUrl]).includes("click") && // @ts-ignore
        Object.keys(analytics.event[secondHalfOfUrl].click).includes("go_to_myNJ_registration")
      ) {
        // @ts-ignore
        analytics.event[secondHalfOfUrl].click.go_to_myNJ_registration();
      }
    }
  };

  /* eslint-disable jsx-a11y/anchor-is-valid */
  return (
    <a href="#" onClick={onClick}>
      {props.children[0]}
    </a>
  );
};
