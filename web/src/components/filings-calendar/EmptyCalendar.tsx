import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const EmptyCalendar = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <div data-testid="empty-calendar" className="padding-y-0">
      <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col usa-prose padding-y-205 padding-x-3">
        <Content>{Config.dashboardDefaults.emptyCalendarTitleText}</Content>
        <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />
      </div>
    </div>
  );
};
