import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, ReactNode, useContext } from "react";

export const NeedsAccountModalWrapper = (props: {
  children: ReactNode;
  CMS_ONLY_disable_overlay?: boolean;
}): ReactElement<any> => {
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  useMountEffectWhenDefined(() => {
    if (isAuthenticated !== IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(true);
    }
  }, isAuthenticated);

  if (isAuthenticated === IsAuthenticated.TRUE || props.CMS_ONLY_disable_overlay) {
    return <>{props.children}</>;
  }
  return (
    <div className="disabled-overlay">
      <div className="cursor-wrapper">{props.children}</div>
    </div>
  );
};
