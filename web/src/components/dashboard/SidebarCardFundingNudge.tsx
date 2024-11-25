import { SectorModal } from "@/components/dashboard/SectorModal";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { gov2GoSignupAndFetchTaxEvents } from "@/lib/taxation/helpers";
import { SidebarCardContent } from "@/lib/types/types";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, OperatingPhaseId, ProfileData } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFundingNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const router = useRouter();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const { updateQueue, business } = useUserData();

  useMountEffectWhenDefined(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, business);

  const updateToUpAndRunningAndCompleteTaxTask = async (): Promise<void> => {
    if (!business) return;
    await updateQueue
      ?.queueProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      })
      .update();

    console.log("Updated to up and running");

    if (!updateQueue) return;

    console.log("Updating to up and running and completing tax task");

    await gov2GoSignupAndFetchTaxEvents({
      business,
      profileData,
      updateQueue,
      queueUpdateTaskProgress,
    });

    console.log("Updated to up and running and completed tax task");

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
