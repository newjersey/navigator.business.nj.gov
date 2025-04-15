import { Icon } from "@/components/njwds/Icon";
import { ProfileTabs } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  tab: ProfileTabs;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
  tabIcon: "info-outline" | "bar-chart" | "folder-open" | "edit";
  tabText: string;
}

export const ProfileTab = (props: Props): ReactElement => {
  return (
    <button
      className={`profile-tab ${props.activeTab === props.tab ? "selected" : ""}`}
      data-testid={props.tab}
      onClick={(): void => props.setProfileTab(props.tab)}
    >
      <div className="profile-tab-left-content">
        <img src={`/img/${props.tabIcon}.svg`} alt="" role="presentation" />
        <div className="profile-tab-text">{props.tabText}</div>
      </div>
      <Icon className="usa-icon--size-3" iconName="navigate_next" />
    </button>
  );
};
