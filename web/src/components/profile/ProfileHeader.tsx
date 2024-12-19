import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  business?: Business;
  isAuthenticated?: boolean;
}

export const ProfileHeader = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <div data-testid="profile-header">
      <Heading level={1}>
        {`${Config.profileDefaults.default.profilePageTitlePrefix} ${getNavBarBusinessTitle(
          props.business,
          props.isAuthenticated ?? false
        )}`}
      </Heading>
    </div>
  );
};
