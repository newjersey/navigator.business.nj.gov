import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { useRouter } from "next/router";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";

interface QueryControlledAlertConfig {
  queryKey: string;
  pagePath: string;
  headerText: string;
  bodyText: string;
  variant: AlertVariant;
  dataTestId?: string;
}

export const useQueryControlledAlert = (config: QueryControlledAlertConfig): ReactElement => {
  const router = useRouter();
  const [alertIsVisible, setAlertIsVisible] = useState<boolean>(false);
  const effectOccurred = useRef<boolean>(false);

  const redirect = useCallback(() => {
    router.replace({ pathname: config.pagePath }, undefined, { shallow: true });
  }, [router, config.pagePath]);

  useEffect(() => {
    if (!router.isReady || effectOccurred.current) return;
    if (router.query[config.queryKey] === "true") {
      setAlertIsVisible(true);
      redirect();
      effectOccurred.current = true;
    }
  }, [router, setAlertIsVisible, config.queryKey, redirect]);

  return (
    <ToastAlert
      variant={config.variant}
      isOpen={alertIsVisible}
      close={() => {
        setAlertIsVisible(false);
        redirect();
      }}
      heading={config.headerText}
      dataTestid={config.dataTestId}
    >
      <Content>{config.bodyText}</Content>
    </ToastAlert>
  );
};
