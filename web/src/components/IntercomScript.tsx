import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { BusinessPersona } from "@businessnjgovnavigator/shared/profileData";

import Script from "next/script";
import { ReactElement, useEffect } from "react";

export const IntercomScript = ({
  user,
  operatingPhaseId,
  legalStructureId,
  industryId,
  businessPersona,
}: {
  user?: BusinessUser;
  operatingPhaseId?: OperatingPhaseId;
  legalStructureId?: string;
  industryId?: string;
  businessPersona?: BusinessPersona;
}): ReactElement<any> => {
  useEffect(() => {
    if (!operatingPhaseId) return;
    const item = document.querySelector("#intercom-identity");
    item?.setAttribute("data-user-operating-phase", operatingPhaseId);
    if (legalStructureId) {
      item?.setAttribute("data-user-legal-structure", legalStructureId);
    }
    if (industryId) {
      item?.setAttribute("data-user-industry-id", industryId);
    }
    if (businessPersona) {
      item?.setAttribute("data-user-business-persona", businessPersona);
    }
  }, [operatingPhaseId, legalStructureId, industryId, businessPersona]);
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
        data-user-legal-structure={legalStructureId}
        data-user-industry-id={industryId}
        data-user-business-persona={businessPersona}
      />
    );
  }
  return <></>;
};
