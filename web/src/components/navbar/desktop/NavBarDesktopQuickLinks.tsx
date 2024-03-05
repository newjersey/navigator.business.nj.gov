import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { openInNewTab } from "@/lib/utils/helpers";
import { ReactElement } from "react";

export const NavBarDesktopQuickLinks = (): ReactElement => {
  const { Config } = useConfig();

  const sharedMargins = "margin-right-3";

  return (
    <div className={"display-flex flex-row flex-align-center"}>
      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): void => openInNewTab(Config.navigationDefaults.navigationQuickLinks.navBarPlanLink)}
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarPlanText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): void => openInNewTab(Config.navigationDefaults.navigationQuickLinks.navBarStartLink)}
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarStartText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): void => openInNewTab(Config.navigationDefaults.navigationQuickLinks.navBarOperateLink)}
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarOperateText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): void => openInNewTab(Config.navigationDefaults.navigationQuickLinks.navBarGrowLink)}
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarGrowText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): void => openInNewTab(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesLink)}
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText}
        </UnStyledButton>
      </div>

      <div className={`${sharedMargins} nav-bar-icon-search-outline`}>
        <UnStyledButton
          onClick={(): void => openInNewTab(Config.navigationDefaults.navigationQuickLinks.navBarSearchLink)}
          dataTestid={"navbar-search-icon"}
          ariaLabel={"search-icon"}
        >
          <Icon>search</Icon>
        </UnStyledButton>
      </div>
    </div>
  );
};
