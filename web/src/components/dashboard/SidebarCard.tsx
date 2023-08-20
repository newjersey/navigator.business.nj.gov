import { SidebarCardFormationNudge } from "@/components/dashboard/SidebarCardFormationNudge";
import { SidebarCardFundingNudge } from "@/components/dashboard/SidebarCardFundingNudge";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { SidebarCardGoToProfileNudge } from "@/components/dashboard/SidebarCardGoToProfileNudge";
import { SidebarCardRegisteredForTaxesNudge } from "@/components/dashboard/SidebarCardRegisteredForTaxesNudge";
import { SidebarCardTaskProgress } from "@/components/dashboard/SidebarCardTaskProgress";
import { SidebarCardContent } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { ReactElement } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCard = (props: Props): ReactElement => {
  return (
    <>
      {rswitch(props.card.id, {
        "task-progress": <SidebarCardTaskProgress card={props.card} />,
        "funding-nudge": <SidebarCardFundingNudge card={props.card} />,
        "formation-nudge": <SidebarCardFormationNudge card={props.card} />,
        "registered-for-taxes-nudge": <SidebarCardRegisteredForTaxesNudge card={props.card} />,
        "go-to-profile": <SidebarCardGoToProfileNudge card={props.card} />,
        default: (
          <SidebarCardGeneric
            card={props.card}
            headerText={props.card.header}
            bodyText={props.card.contentMd}
          />
        ),
      })}
    </>
  );
};
