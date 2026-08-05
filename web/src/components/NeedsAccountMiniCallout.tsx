import { Content } from "@/components/Content";
import { MiniCallout } from "@/components/njwds-extended/callout/MiniCallout";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useContext } from "react";

export const NeedsAccountMiniCallout = (): ReactElement => {
  const { isAuthenticated } = useContext(NeedsAccountContext);
  const { Config } = useConfig();

  return isAuthenticated === IsAuthenticated.FALSE ? (
    <MiniCallout calloutType="warning">
      <Content>{Config.taskDefaults.needsAccountCallout}</Content>
    </MiniCallout>
  ) : (
    <></>
  );
};
