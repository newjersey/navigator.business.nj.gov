import { SectorModal } from "@/components/dashboard/SectorModal";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { toBeNamed } from "@/lib/taxation/helpers";
import { SidebarCardContent } from "@/lib/types/types";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

// no need to test analytics - aleks goes that

export const SidebarCardFundingNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  // const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const { updateQueue, business } = useUserData();

  // useMountEffectWhenDefined(() => {
  //   if (!business) return;
  //   setProfileData(business.profileData);
  // }, business);

  const updateToUpAndRunningAndCompleteTaxTask = async (): Promise<void> => {
    if (!updateQueue) return;

    // .update();
    // if (!updateQueue) return;

    // await gov2GoSignupAndFetchTaxEvents({
    //   business,
    //   profileData: business.profileData,
    //   updateQueue,
    //   // queueUpdateTaskProgress:,
    // });

    await toBeNamed({ updateQueue });
    updateQueue?.queueProfileData({
      operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
    });
    await updateQueue.update();

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
