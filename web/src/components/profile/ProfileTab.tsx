import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  tab: ProfileTabs;
  activeTab: ProfileTabs;
  setProfileTab: (profileTab: ProfileTabs) => void;
}

export const ProfileTab = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const lookupName = (tab: ProfileTabs): string => {
    switch (tab) {
      case "documents":
        return Config.profileDefaults.default.profileTabDocsTitle;
      case "info":
        return Config.profileDefaults.default.profileTabInfoTitle;
      case "notes":
        return Config.profileDefaults.default.profileTabNoteTitle;
      case "numbers":
        return Config.profileDefaults.default.profileTabRefTitle;
    }
  };

  return (
    <button
      className="cursor-pointer width-100 bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3 border-2px border-base-lighter btn-profile-hoverstate line-height-120"
      style={{ borderStyle: "none solid solid solid" }}
      data-testid={props.tab}
      onClick={(): void => props.setProfileTab(props.tab)}
    >
      <div className={props.activeTab === props.tab ? "selected" : ""}>{lookupName(props.tab)}</div>
      <Icon className="usa-icon--size-3 margin-x-1">navigate_next</Icon>
    </button>
  );
};
