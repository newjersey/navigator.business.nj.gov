import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  tab: ProfileTabs;
}

export const ProfileTabHeader = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const getTitle = (): string => {
    switch (props.tab) {
      case "info":
        return Config.profileDefaults.default.profileTabInfoTitle;
      case "numbers":
        return Config.profileDefaults.default.profileTabRefTitle;
      case "documents":
        return Config.profileDefaults.default.profileTabDocsTitle;
      case "notes":
        return Config.profileDefaults.default.profileTabNoteTitle;
    }
  };

  return (
    <div data-testid="profile-header">
      <hr className="margin-top-4 margin-bottom-2" aria-hidden={true} />
      <Heading level={2} className="margin-bottom-4" style={{ fontWeight: 300 }}>
        {getTitle()}
      </Heading>
    </div>
  );
};
