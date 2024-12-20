import { SidebarCardGeneric } from "@/components/dashboard/SidebarCardGeneric";
import { ROUTES } from "@/lib/domain-logic/routes";
import { SidebarCardContent } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement } from "react";

type Props = {
  card: SidebarCardContent;
};

export const SidebarCardGoToProfileNudge = (props: Props): ReactElement<any> => {
  const router = useRouter();

  const onClick = (): void => {
    analytics.event.go_to_profile_nudge.click.go_to_profile();
    router.push(ROUTES.profile);
  };

  return <SidebarCardGeneric card={props.card} preBodyButtonOnClick={onClick} />;
};
