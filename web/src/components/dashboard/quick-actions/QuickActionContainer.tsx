import { QuickActionTile } from "@/components/dashboard/quick-actions/QuickActionTile";
import { MediaQueries } from "@/lib/PageSizes";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QuickActionLicenseReinstatement, QuickActionLink, QuickActionTask } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  quickActionTasks: QuickActionTask[];
  quickActionLinks: QuickActionLink[];
  quickActionLicenseReinstatements: QuickActionLicenseReinstatement[];
}
export const QuickActionsContainer = ({
  quickActionTasks,
  quickActionLinks,
  quickActionLicenseReinstatements,
}: Props): ReactElement => {
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

  const licenseReinstatementMatch = (action: QuickActionLicenseReinstatement): boolean => {
    if (
      action.industryIds &&
      industryId &&
      action.industryIds.includes(industryId) &&
      business.licenseData?.status === "EXPIRED"
    ) {
      return true;
    }
    return false;
  };

  const filteredLicenseReinstatements = quickActionLicenseReinstatements
    ? quickActionLicenseReinstatements
        .filter((action) => licenseReinstatementMatch(action))
        .map((action) => <QuickActionTile type="license" quickAction={action} key={action.filename} />)
    : [];

  return (
    <div className={isDesktopAndUp ? "grid-row grid-gap" : ""} data-testid="quick-actions-section">
      {[...filteredTasks, ...filteredLinks, ...filteredLicenseReinstatements]}
    </div>
  );
};
