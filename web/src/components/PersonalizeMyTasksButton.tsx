import { GradientButton } from "@/components/njwds-extended/GradientButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ProfileTabs } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

interface Props {
  tabValue?: ProfileTabs;
}

export const PersonalizeMyTasksButton = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();
  const tabValue: ProfileTabs = props.tabValue ?? "info";

  const handleClick = (): void => {
    analytics.event.roadmap_personlize_my_tasks_button.click.go_to_profile_tasks_screen();
    router && router.push(`${ROUTES.profile}?tab=${tabValue}`);
  };

  return (
    <GradientButton
      text={Config.dashboardHeaderDefaults.personalizeMyTasksButtonText}
      onClick={handleClick}
      icon="star"
      role="link"
      ariaLabel={Config.dashboardHeaderDefaults.personalizeMyTasksButtonText}
      overWriteWidth={true}
    />
  );
};
