import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { formationTaskId } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";
import { FormationDateModal } from "../FormationDateModal";
import { SidebarCardGeneric } from "./SidebarCardGeneric";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFormationNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { userData, updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  const updateFormationDateAndTaskProgress = async () => {
    if (!userData || !updateQueue) return;
    queueUpdateTaskProgress(formationTaskId, "COMPLETED");
    await updateQueue.update();
    routeShallowWithQuery(router, QUERIES.fromForming, "true");
  };

  const onClick = async () => {
    if (!userData) return;
    setModalOpen(true);
    analytics.event.formation_nudge_button.click.show_formation_date_modal();
  };

  return (
    <>
      <FormationDateModal
        isOpen={modalOpen}
        close={() => setModalOpen(false)}
        onSave={updateFormationDateAndTaskProgress}
      />
      <SidebarCardGeneric
        card={props.card}
        bodyText={props.card.contentMd}
        headerText={props.card.header}
        ctaOnClick={onClick}
      />
    </>
  );
};
