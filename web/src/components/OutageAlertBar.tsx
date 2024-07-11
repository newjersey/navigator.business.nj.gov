import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { OutageAlertType, OutageConfig } from "@/lib/types/types";
import { useMountEffect } from "@/lib/utils/helpers";
import axios from "axios";
import { ReactElement, useContext, useState } from "react";

export const OutageAlertBar = (): ReactElement => {
  const { state } = useContext(AuthContext);

  const [outageConfig, setOutageConfig] = useState<OutageConfig>({
    FEATURE_ENABLE_OUTAGE_ALERT_BAR: false,
    OUTAGE_ALERT_MESSAGE: "",
    OUTAGE_ALERT_TYPE: undefined,
  });

  const isEnabled = outageConfig.FEATURE_ENABLE_OUTAGE_ALERT_BAR;
  const message = outageConfig.OUTAGE_ALERT_MESSAGE;
  const alertType = outageConfig.OUTAGE_ALERT_TYPE as OutageAlertType;
  const urlToFetchFrom = process.env.OUTAGE_ALERT_CONFIG_URL || "";

  useMountEffect(() => {
    if (!urlToFetchFrom) return;
    axios
      .get(urlToFetchFrom)
      .then((response) => {
        setOutageConfig(response.data);
      })
      .catch(() => {});
  });

  if (!isEnabled || !alertType || !message) return <></>;
  if (alertType === "LOGGED_IN_ONLY" && state.isAuthenticated !== IsAuthenticated.TRUE) {
    return <></>;
  }
  if (alertType === "UNREGISTERED_ONLY" && state.isAuthenticated !== IsAuthenticated.FALSE) {
    return <></>;
  }

  return (
    <div
      className="display-flex flex-justify-center flex-align-center bg-red text-white font-sans-xs minh-3 margin-auto width-full padding-y-1 padding-x-1"
      data-testid="outage-alert-bar"
      role="alert"
    >
      <strong>Alert:</strong>
      <span className="margin-left-05">{message}</span>
    </div>
  );
};
