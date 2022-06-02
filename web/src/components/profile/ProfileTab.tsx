import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { Box } from "@mui/material";
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
        return Config.profileDefaults.profileTabDocsTitle;
      case "info":
        return Config.profileDefaults.profileTabInfoTitle;
      case "notes":
        return Config.profileDefaults.profileTabNoteTitle;
      case "numbers":
        return Config.profileDefaults.profileTabRefTitle;
    }
  };

  return (
    <Box
      className="bg-base-lightest flex fjb fac padding-y-1 padding-right-2 padding-left-3"
      sx={{
        "&:hover, & .selected": {
          color: "primary.dark",
          fontWeight: "bold",
          opacity: [0.8],
        },
        border: "2px #e6e6e6",
        borderStyle: "none solid solid solid",
      }}
      data-testid={props.tab}
      onClick={() => props.setProfileTab(props.tab)}
    >
      <span className={props.activeTab == props.tab ? "selected" : ""}>{lookupName(props.tab)}</span>
      <Icon className="usa-icon--size-3 margin-x-1">navigate_next</Icon>
    </Box>
  );
};
