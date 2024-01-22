import { QuickActionTile } from "@/components/dashboard/QuickActionTile";
import { MediaQueries } from "@/lib/PageSizes";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QuickActionLink, QuickActionTask } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  quickActionTasks: QuickActionTask[];
  quickActionLinks: QuickActionLink[];
}
export const QuickActionsContainer = ({ quickActionTasks, quickActionLinks }: Props): ReactElement => {
  const { business } = useUserData();
  const industryId = business?.profileData.industryId;
  const sectorId = business?.profileData.sectorId;
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  if (!business) {
    return <></>;
  }
  const findMatch = (action: QuickActionTask | QuickActionLink): boolean => {
    if (action.applyToAllUsers) return true;
    if (action.industryIds && industryId && action.industryIds.includes(industryId)) return true;
    if (action.sectorIds && sectorId && action.sectorIds.includes(sectorId)) return true;
    return false;
  };

  const filteredTasks = quickActionTasks
    ? quickActionTasks
        .filter((action) => findMatch(action))
        .map((action) => <QuickActionTile type="task" quickAction={action} key={action.filename} />)
    : [];

  const filteredLinks = quickActionLinks
    ? quickActionLinks
        .filter((action) => findMatch(action))
        .map((action) => <QuickActionTile type="link" quickAction={action} key={action.filename} />)
    : [];

  return (
    <div className={isDesktopAndUp ? "grid-row grid-gap" : ""} data-testid="quick-actions-section">
      {[...filteredTasks, ...filteredLinks]}
    </div>
  );
};
