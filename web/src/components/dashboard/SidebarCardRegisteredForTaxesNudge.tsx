import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, routeShallowWithQuery } from "@/lib/domain-logic/routes";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { taxTaskId } from "@businessnjgovnavigator/shared";
import { useRouter } from "next/router";
import { ReactElement } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardRegisteredForTaxesNudge = (props: Props): ReactElement => {
  const { updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();

  const router = useRouter();

  const updateTaxInformationAndTaskProgress = async (): Promise<void> => {
    if (!updateQueue) return;
    queueUpdateTaskProgress(taxTaskId, "COMPLETED");
    await updateQueue.update();
    routeShallowWithQuery(router, QUERIES.fromTaxRegistrationCard, "true");
    analytics.event.tax_registration_snackbar.submit.show_tax_registration_success_snackbar();
  };

  return (
    <>
      <SidebarCardGeneric
        card={props.card}
        bodyText={props.card.contentMd}
        headerText={props.card.header}
        ctaOnClick={updateTaxInformationAndTaskProgress}
      />
    </>
  );
};
