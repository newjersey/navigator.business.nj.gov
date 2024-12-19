import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { QUERIES } from "@/lib/domain-logic/routes";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

interface QueryControlledAlertConfig {
  queryKey: QUERIES;
  pagePath: string;
  headerText: string;
  bodyText: string;
  variant: AlertVariant;
  dataTestId?: string;
  delayInMilliseconds?: number;
}

export const useQueryControlledAlert = (config: QueryControlledAlertConfig): ReactElement<any> => {
  const router = useRouter();
  const [alertIsVisible, setAlertIsVisible] = useState<boolean>(false);
  const effectOccurred = useRef<boolean>(false);

  const redirect = useCallback(() => {
    router.replace({ pathname: config.pagePath }, undefined, { shallow: true });
  }, [router, config.pagePath]);

  useEffect(() => {
    if (!router.isReady || effectOccurred.current) {
      return;
    }
    if (router.query[config.queryKey] === "true") {
      if (config.delayInMilliseconds) {
        setTimeout(() => {
          return setAlertIsVisible(true);
        }, config.delayInMilliseconds);
      } else {
        setAlertIsVisible(true);
      }
      redirect();
      effectOccurred.current = true;
    }
  }, [router, setAlertIsVisible, config.queryKey, config.delayInMilliseconds, redirect]);

  return (
    <SnackbarAlert
      variant={config.variant}
      isOpen={alertIsVisible}
      close={(): void => {
        setAlertIsVisible(false);
        redirect();
      }}
      heading={config.headerText}
      dataTestid={config.dataTestId}
    >
      <Content>{config.bodyText}</Content>
    </SnackbarAlert>
  );
};
