import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ReactElement, useContext } from "react";

type OutageAlertType = "ALL" | "UNREGISTERED_ONLY" | "LOGGED_IN_ONLY" | undefined;

export const OutageAlertBar = (): ReactElement => {
  const { state } = useContext(AuthContext);

  const isEnabled = process.env.FEATURE_ENABLE_OUTAGE_ALERT_BAR === "true";
  const message = process.env.OUTAGE_ALERT_MESSAGE;
  const alertType = process.env.OUTAGE_ALERT_TYPE as OutageAlertType;

  if (!isEnabled || !alertType || !message) return <></>;
  if (alertType === "LOGGED_IN_ONLY" && state.isAuthenticated !== IsAuthenticated.TRUE) {
    return <></>;
  }
  if (alertType === "UNREGISTERED_ONLY" && state.isAuthenticated !== IsAuthenticated.FALSE) {
    return <></>;
  }

  return (
    <div
      className="display-flex flex-justify-center flex-align-center bg-red text-white font-sans-xs minh-3 margin-auto width-full padding-y-1"
      data-testid="outage-alert-bar"
    >
      <b>Alert:</b>
      <span className="margin-left-05">{message}</span>
    </div>
  );
};
