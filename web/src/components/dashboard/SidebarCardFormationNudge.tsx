import { useUserData } from "@/lib/data-hooks/useUserData";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { formationTaskId, TaskProgress, UserData } from "@businessnjgovnavigator/shared/";
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
  const { userData, update } = useUserData();

  const updateFormationDateAndTaskProgress = async (
    newValue: TaskProgress,
    userDataWithNewDateOfFormation: UserData
  ) => {
    if (!userData) return;

    const newDateOfFormation = userDataWithNewDateOfFormation.profileData.dateOfFormation;
    await update({
      ...userData,
      taskProgress: {
        ...userData.taskProgress,
        [formationTaskId]: "COMPLETED",
      },
      profileData: {
        ...userData.profileData,
        dateOfFormation: newDateOfFormation,
      },
    });
    router.push({ query: { fromForming: "true" } }, undefined, { shallow: true });
  };

  const onClick = async () => {
    if (!userData) return;
    setModalOpen(true);
    analytics.event.formation_date_modal.submit.formation_status_set_to_complete();
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
      ></SidebarCardGeneric>
    </>
  );
};
