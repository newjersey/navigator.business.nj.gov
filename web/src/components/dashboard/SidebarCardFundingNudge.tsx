import { SectorModal } from "@/components/dashboard/SectorModal";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { SidebarCardContent } from "@/lib/types/types";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFundingNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { updateQueue, business } = useUserData();

  const updateToUpAndRunningAndCompleteTaxTask = async (): Promise<void> => {
    if (!business) return;
    await updateQueue
      ?.queueProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      })
      .update();
    routeShallowWithQuery(router, QUERIES.fromFunding, "true");
  };

  const onClick = async (): Promise<void> => {
    if (!business) return;
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
