import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileTabSubText } from "@/components/profile/ProfileTabSubText";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ProfileTabs } from "@businessnjgovnavigator/shared/types";
import { ReactElement, forwardRef } from "react";

interface Props {
  tab: ProfileTabs;
}

export const ProfileTabHeader = forwardRef<HTMLDivElement, Props>(
  (props: Props, ref): ReactElement => {
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
        case "personalize":
          return Config.profileDefaults.default.profileTabPersonalizeYourTasksTitle;
      }
    };

    return (
      <div ref={ref} data-testid="profile-tab-header">
        <hr className="desktop:margin-top-0 margin-top-4 margin-bottom-2" aria-hidden={true} />
        <Heading level={2} className="margin-bottom-4">
          {getTitle()}
        </Heading>
        {(props.tab === "permits" || props.tab === "personalize") && (
          <ProfileTabSubText text={Config.profileDefaults.default.permitsAndLicensesSubText} />
        )}
      </div>
    );
  },
);

ProfileTabHeader.displayName = "ProfileTabHeader";
