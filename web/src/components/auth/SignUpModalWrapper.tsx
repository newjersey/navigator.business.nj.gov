import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { ReactElement, ReactNode, useContext } from "react";

export const SignUpModalWrapper = (props: { children: ReactNode }): ReactElement => {
  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);
  useMountEffectWhenDefined(() => {
    if (isAuthenticated != IsAuthenticated.TRUE) {
      setModalIsVisible(true);
    }
  }, isAuthenticated);

  if (isAuthenticated != IsAuthenticated.TRUE) {
    return (
      <div className="disabled-overlay">
        <div className="cursor-wrapper">{props.children}</div>
      </div>
    );
  }
  return <>{props.children}</>;
};
