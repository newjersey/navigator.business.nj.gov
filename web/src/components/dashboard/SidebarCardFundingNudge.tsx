import { SectorModal } from "@/components/dashboard/SectorModal";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { registerForGov2GoAndFetchTaxFilingEvents } from "@/lib/tax-access/taxAccess";
import { SidebarCardContent } from "@/lib/types/types";
import { createEmptyProfileData, OperatingPhaseId } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFundingNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const { updateQueue, business } = useUserData();

  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

  useEffect(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, [business]);

  const updateToUpAndRunningAndCompleteTaxTask = async (): Promise<void> => {
    if (!business) return;

    await updateQueue
      ?.queueProfileData({
        operatingPhase: OperatingPhaseId.UP_AND_RUNNING,
      })
      .update();
    routeShallowWithQuery(router, QUERIES.fromFunding, "true");

    await registerForGov2GoAndFetchTaxFilingEvents({
      business,
      businessProfileDataTaxId: business.profileData.taxId,
      queueUpdateTaskProgress,
      tempProfileDataTaxId: profileData.taxId,
      updateQueue,
      tempBusinessName: profileData.businessName,
      tempResponsibleOwnerName: profileData.responsibleOwnerName,
    });
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
