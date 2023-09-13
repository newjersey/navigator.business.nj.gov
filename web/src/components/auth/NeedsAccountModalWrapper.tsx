import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, ReactNode, useContext } from "react";

export const NeedsAccountModalWrapper = (props: { children: ReactNode }): ReactElement => {
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  useMountEffectWhenDefined(() => {
    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(true);
    }
  }, isAuthenticated);

  if (isAuthenticated !== IsAuthenticated.TRUE) {
    return (
      <div className="disabled-overlay">
        <div className="cursor-wrapper">{props.children}</div>
      </div>
    );
  }
  return <>{props.children}</>;
};
