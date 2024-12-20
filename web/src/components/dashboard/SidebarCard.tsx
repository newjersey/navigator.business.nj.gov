import { SidebarCardFormationNudge } from "@/components/dashboard/SidebarCardFormationNudge";
import { SidebarCardFundingNudge } from "@/components/dashboard/SidebarCardFundingNudge";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { SidebarCardGoToProfileNudge } from "@/components/dashboard/SidebarCardGoToProfileNudge";
import { SidebarCardContent } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import { ReactElement } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCard = (props: Props): ReactElement<any> => {
  return (
    <>
      {rswitch(props.card.id, {
        [SIDEBAR_CARDS.fundingNudge]: <SidebarCardFundingNudge card={props.card} />,
        [SIDEBAR_CARDS.formationNudge]: <SidebarCardFormationNudge card={props.card} />,
        [SIDEBAR_CARDS.goToProfile]: <SidebarCardGoToProfileNudge card={props.card} />,
        default: <SidebarCardGeneric card={props.card} />,
      })}
    </>
  );
};
