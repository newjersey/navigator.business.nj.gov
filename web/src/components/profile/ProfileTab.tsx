import { Icon } from "@/components/njwds/Icon";
import { ProfileTabs } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  tab: ProfileTabs;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
  tabText: string;
  hasTopBorder?: boolean;
}

export const ProfileTab = (props: Props): ReactElement => {
  return (
    <button
      className="cursor-pointer profile-tab-nav-button bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3 border-2px border-base-lighter btn-profile-hoverstate line-height-120"
      style={{ borderStyle: props.hasTopBorder ? "solid" : "none solid solid solid" }}
      data-testid={props.tab}
      onClick={(): void => props.setProfileTab(props.tab)}
    >
      <div className={`${props.activeTab === props.tab ? "selected" : ""} tal`}>{props.tabText}</div>
      <Icon className="usa-icon--size-3 margin-x-1" iconName="navigate_next" />
    </button>
  );
};
