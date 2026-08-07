import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ReactElement, useContext } from "react";

type Props = {
  className?: string;
};

export const LockIcon = (props: Props): ReactElement | null => {
  const { isAuthenticated } = useContext(NeedsAccountContext);

  if (isAuthenticated === IsAuthenticated.FALSE) {
    return (
      <svg className={`usa-icon ${props.className || ""}`} aria-hidden="true" role="img">
        <use xlinkHref="/sprite.svg#lock"></use>
      </svg>
    );
  }

  return null;
};
