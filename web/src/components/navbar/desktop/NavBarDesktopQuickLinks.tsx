import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

export const NavBarDesktopQuickLinks = (): ReactElement => {
  const { Config } = useConfig();

  const sharedMargins = "margin-x-1"

  return (
    <div className={"display-flex flex-row flex-align-center"}>
      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): Window | null =>
            window.open(Config.navigationDefaults.navigationQuickLinks.navBarPlanLink, "_blank")
          }
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarPlanText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): Window | null =>
            window.open(Config.navigationDefaults.navigationQuickLinks.navBarStartLink, "_blank")
          }
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarStartText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): Window | null =>
            window.open(Config.navigationDefaults.navigationQuickLinks.navBarOperateLink, "_blank")
          }
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarOperateText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): Window | null =>
            window.open(Config.navigationDefaults.navigationQuickLinks.navBarGrowLink, "_blank")
          }
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarGrowText}
        </UnStyledButton>
      </div>

      <div className={sharedMargins}>
        <UnStyledButton
          onClick={(): Window | null =>
            window.open(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesLink, "_blank")
          }
        >
          {Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText}
        </UnStyledButton>
      </div>

      <div className={`${sharedMargins} search-outline`}>
        <Icon>search</Icon>
      </div>
    </div>
  );
};
