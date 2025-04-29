import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileTabSubText } from "@/components/profile/ProfileTabSubText";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  tab: ProfileTabs;
  subText?: string;
}

export const ProfileTabHeader = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const getTitle = (): string => {
    switch (props.tab) {
      case "info":
        return Config.profileDefaults.default.profileTabInfoTitle;
      case "permits":
        return Config.profileDefaults.default.profileTabPermitsTitle;
      case "numbers":
        return Config.profileDefaults.default.profileTabNumbersTitle;
      case "documents":
        return Config.profileDefaults.default.profileTabDocsTitle;
      case "notes":
        return Config.profileDefaults.default.profileTabNoteTitle;
    }
  };

  return (
    <div data-testid="profile-tab-header">
      <hr className="desktop:margin-top-0 margin-top-4 margin-bottom-2" aria-hidden={true} />
      <Heading level={2} className="margin-bottom-4" style={{ fontWeight: 300 }}>
        {getTitle()}
      </Heading>
      {props.tab === "permits" && (
        <ProfileTabSubText text={Config.profileDefaults.default.permitsAndLicensesSubText} />
      )}
    </div>
  );
};
