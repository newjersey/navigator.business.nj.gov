import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import Script from "next/script";
import { ReactElement, useEffect } from "react";

export const IntercomScript = ({
  user,
  operatingPhaseId,
}: {
  user?: BusinessUser;
  operatingPhaseId?: OperatingPhaseId;
}): ReactElement => {
  useEffect(() => {
    if (!operatingPhaseId) return;
    const item = document.querySelector("#intercom-identity");
    item?.setAttribute("data-user-operating-phase", operatingPhaseId);
  }, [operatingPhaseId]);
  if (user?.myNJUserKey && operatingPhaseId) {
    return (
      <Script
        id="intercom-identity"
        src="/intercom/identity.js"
        data-user-id={user?.myNJUserKey}
        data-user-uuid={user?.id}
        data-user-hash={user?.intercomHash}
        data-user-name={user?.name}
        data-user-email={user?.email}
        data-user-operating-phase={operatingPhaseId}
      />
    );
  }
  return <></>;
};
