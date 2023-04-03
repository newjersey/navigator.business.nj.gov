import { SectorModal } from "@/components/dashboard/SectorModal";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { SidebarCardContent } from "@/lib/types/types";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFundingNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { userData, update } = useUserData();

  const updateUserToUpAndRunning = async (): Promise<void> => {
    if (!userData) {
      return;
    }
    await update({
      ...userData,
      profileData: {
        ...userData.profileData,
        operatingPhase: "UP_AND_RUNNING",
      },
    });
    routeShallowWithQuery(router, QUERIES.fromFunding, "true");
  };

  const onClick = async (): Promise<void> => {
    if (!userData) {
      return;
    }
    if (userData.profileData.industryId === "generic" || !userData.profileData.industryId) {
      setModalOpen(true);
    } else {
      await updateUserToUpAndRunning();
    }
  };

  return (
    <>
      <SectorModal
        open={modalOpen}
        handleClose={(): void => setModalOpen(false)}
        onContinue={updateUserToUpAndRunning}
      />
      <SidebarCardGeneric
        card={props.card}
        headerText={props.card.header}
        bodyText={props.card.contentMd}
        ctaOnClick={onClick}
      />
    </>
  );
};
