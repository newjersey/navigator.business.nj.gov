import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const EmptyCalendar = (): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <div data-testid="empty-calendar">
      <Content>{Config.dashboardDefaults.emptyCalendarTitleText}</Content>
      <div className="flex flex-column fac padding-top-205">
        <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />
      </div>
    </div>
  );
};
