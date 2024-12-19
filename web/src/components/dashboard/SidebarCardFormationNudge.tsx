import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { FormationDateModal } from "@/components/FormationDateModal";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { formationTaskId } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardFormationNudge = (props: Props): ReactElement<any> => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const router = useRouter();
  const { business, updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  const updateFormationDateAndTaskProgress = async (): Promise<void> => {
    if (!business || !updateQueue) {
      return;
    }
    queueUpdateTaskProgress(formationTaskId, "COMPLETED");
    await updateQueue.update();
    routeShallowWithQuery(router, QUERIES.fromForming, "true");
  };

  const onClick = (): void => {
    if (!business) {
      return;
    }
    setModalOpen(true);
    analytics.event.formation_nudge_button.click.show_formation_date_modal();
  };

  return (
    <>
      <FormationDateModal
        isOpen={modalOpen}
        close={(): void => setModalOpen(false)}
        onSave={updateFormationDateAndTaskProgress}
      />
      <SidebarCardGeneric card={props.card} ctaOnClick={onClick} />
    </>
  );
};
