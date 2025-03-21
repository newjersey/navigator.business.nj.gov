import { SectorModal } from "@/components/dashboard/SectorModal";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { gov2GovTaxFiling } from "@/lib/taxation/helpers";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/compat/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFundingNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { updateQueue, business } = useUserData();

  const updateToUpAndRunningAndCompleteTaxTask = async (): Promise<void> => {
    if (!updateQueue) return;

    try {
      await gov2GovTaxFiling({ updateQueue });
    } finally {
      updateQueue?.queueProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      });
      await updateQueue.update();
    }

    router && routeShallowWithQuery(router, QUERIES.fromFunding, "true");
  };

  const onClick = async (): Promise<void> => {
    if (!business) return;
    analytics.event.show_me_funding_opportunities.click.show_me_funding_opportunities();
    if (business.profileData.industryId === "generic" || !business.profileData.industryId) {
      setModalOpen(true);
    } else {
      await updateToUpAndRunningAndCompleteTaxTask();
    }
  };

  return (
    <>
      <SectorModal
        open={modalOpen}
        handleClose={(): void => setModalOpen(false)}
        onContinue={updateToUpAndRunningAndCompleteTaxTask}
      />
      <SidebarCardGeneric card={props.card} ctaOnClick={onClick} />
    </>
  );
};
