import { Icon } from "@/components/njwds/Icon";
import { ProfileTabs } from "@businessnjgovnavigator/shared/types";
import { ReactElement, forwardRef } from "react";

interface Props {
  tab: ProfileTabs;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
  tabIcon:
    | "info-outline"
    | "bar-chart"
    | "content-paste"
    | "folder-open"
    | "edit"
    | "star"
    | "profile";
  tabText: string;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const ProfileTab = forwardRef<HTMLButtonElement, Props>(
  (props: Props, ref): ReactElement => {
    return (
      <button
        id={`tab-${props.tab}`}
        role="tab"
        aria-selected={props.activeTab === props.tab}
        aria-controls={`tabpanel-${props.tab}`}
        className={`profile-tab ${props.activeTab === props.tab ? "selected" : ""}`}
        data-testid={props.tab}
        tabIndex={props.activeTab === props.tab ? 0 : -1}
        onClick={(): void => props.setProfileTab(props.tab)}
        onKeyDown={props.onKeyDown}
        ref={ref}
      >
        <div className="profile-tab-left-content">
          {props.tab !== "personalize" || props.activeTab !== "personalize" ? (
            <img src={`/img/${props.tabIcon}.svg`} alt="" role="presentation" />
          ) : (
            <div className="gradient-star" role="presentation" />
          )}
          <div className="profile-tab-text">{props.tabText}</div>
        </div>
        <Icon className="usa-icon--size-3" iconName="navigate_next" />
      </button>
    );
  },
);

ProfileTab.displayName = "ProfileTab";
