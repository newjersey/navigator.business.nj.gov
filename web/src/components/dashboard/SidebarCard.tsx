import { SidebarCardFundingNudge } from "@/components/dashboard/SidebarCardFundingNudge";
import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { SidebarCardTaskProgress } from "@/components/dashboard/SidebarCardTaskProgress";
import { SidebarCardContent } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { SidebarCardFormationNudge } from "./SidebarCardFormationNudge";
import { SidebarCardTaxRegistrationNudge } from "./SidebarCardTaxRegistrationNudge";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCard = (props: Props) => {
  return (
    <>
      {rswitch(props.card.id, {
        "task-progress": <SidebarCardTaskProgress card={props.card} />,
        "funding-nudge": <SidebarCardFundingNudge card={props.card} />,
        "formation-nudge": <SidebarCardFormationNudge card={props.card} />,
        "tax-registration-nudge": <SidebarCardTaxRegistrationNudge card={props.card} />,
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
