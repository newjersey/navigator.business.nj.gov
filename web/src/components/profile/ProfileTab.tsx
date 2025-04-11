import { Icon } from "@/components/njwds/Icon";
import { ProfileTabs } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  tab: ProfileTabs;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
  tabIcon: string;
  tabText: string;
}

export const ProfileTab = (props: Props): ReactElement => {
  return (
    <button
      className={`profile-tab ${props.activeTab === props.tab ? "selected" : ""}`}
      data-testid={props.tab}
      onClick={(): void => props.setProfileTab(props.tab)}
    >
      <div className="left-content">
        <Icon className="usa-icon--size-3" iconName={props.tabIcon} />
        <div className="profile-tab-text">{props.tabText}</div>
      </div>
      <Icon className="usa-icon--size-3" iconName="navigate_next" />
    </button>
  );
};
