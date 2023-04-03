import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { RegisteredForTaxesModal } from "@/components/RegisteredForTaxesModal";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { taxTaskId } from "@businessnjgovnavigator/shared";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardRegisteredForTaxesNudge = (props: Props): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  const router = useRouter();

  const updateTaxInformationAndTaskProgress = async (): Promise<void> => {
    if (!updateQueue) {
      return;
    }
    queueUpdateTaskProgress(taxTaskId, "COMPLETED");
    await updateQueue.update();
    router.push("/dashboard");
  };

  const onClick = (): void => {
    setModalOpen(true);
    analytics.event.tax_registration_nudge_button.click.show_tax_registration_modal();
  };

  return (
    <>
      <RegisteredForTaxesModal
        isOpen={modalOpen}
        close={(): void => setModalOpen(false)}
        onSave={updateTaxInformationAndTaskProgress}
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
