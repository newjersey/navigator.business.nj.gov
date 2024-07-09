import { AnytimeActionTile } from "@/components/dashboard/anytime-actions/AnytimeActionTile";
import { MediaQueries } from "@/lib/PageSizes";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement, AnytimeActionLink, AnytimeActionTask } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  anytimeActionTasks: AnytimeActionTask[];
  anytimeActionLinks: AnytimeActionLink[];
  anytimeActionLicenseReinstatements: AnytimeActionLicenseReinstatement[];
}
export const AnytimeActionContainer = ({
  anytimeActionTasks,
  anytimeActionLinks,
  anytimeActionLicenseReinstatements,
}: Props): ReactElement => {
  const { business } = useUserData();
  const industryId = business?.profileData.industryId;
  const sectorId = business?.profileData.sectorId;
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  if (!business) {
    return <></>;
  }
  const findMatch = (action: AnytimeActionTask | AnytimeActionLink): boolean => {
    if (action.applyToAllUsers) return true;
    if (action.industryIds && industryId && action.industryIds.includes(industryId)) return true;
    if (action.sectorIds && sectorId && action.sectorIds.includes(sectorId)) return true;
    return false;
  };

  const filteredTasks = anytimeActionTasks
    ? anytimeActionTasks
        .filter((action) => findMatch(action))
        .map((action) => <AnytimeActionTile type="task" anytimeAction={action} key={action.filename} />)
    : [];

  const filteredLinks = anytimeActionLinks
    ? anytimeActionLinks
        .filter((action) => findMatch(action))
        .map((action) => <AnytimeActionTile type="link" anytimeAction={action} key={action.filename} />)
    : [];

  const licenseReinstatementMatch = (action: AnytimeActionLicenseReinstatement): boolean => {
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

  const filteredLicenseReinstatements = anytimeActionLicenseReinstatements
    ? anytimeActionLicenseReinstatements
        .filter((action) => licenseReinstatementMatch(action))
        .map((action) => <AnytimeActionTile type="license" anytimeAction={action} key={action.filename} />)
    : [];

  return (
    <div className={isDesktopAndUp ? "grid-row grid-gap" : ""} data-testid="anytime-actions-section">
      {[...filteredTasks, ...filteredLinks, ...filteredLicenseReinstatements]}
    </div>
  );
};
