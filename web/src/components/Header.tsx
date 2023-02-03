import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { getCurrentDateInNewJersey } from "@businessnjgovnavigator/shared/";
import { useRouter } from "next/router";
import { useContext } from "react";

export const Header = () => {
  const { state } = useContext(AuthContext);

  const { userData } = useUserData();
  const router = useRouter();

  const editOnClick = () => {
    analytics.event.roadmap_profile_edit_button.click.go_to_profile_screen();
    router.push(ROUTES.profile);
  };

  const getHeader = (): string => {
    return userData?.user.name
      ? templateEval(Config.headerDefaults.defaultHeaderText, {
          name: userData.user.name,
        })
      : Config.headerDefaults.noUserNameHeaderText;
  };

  const getButtonText = () => {
    if (state.isAuthenticated === "FALSE" || state.isAuthenticated === "UNKNOWN") {
      return Config.headerDefaults.guestModeToProfileButtonText;
    }

    if (
      (userData?.profileData.businessName === undefined || userData?.profileData.businessName === "") &&
      state.isAuthenticated === "TRUE"
    ) {
      return Config.headerDefaults.genericToProfileButtonText;
    }

    if (userData?.profileData.businessName && state.isAuthenticated === "TRUE") {
      return userData.profileData.businessName;
    }
  };

  return (
    <div className="bg-white margin-bottom-4">
      <h1 className="margin-top-0 break-word">{getHeader()}</h1>
      <UnStyledButton
        style="tertiary"
        underline
        textBold
        onClick={editOnClick}
        dataTestid="header-link-to-profile"
        ariaLabel="Link To Business Profile"
      >
        {getButtonText()}
      </UnStyledButton>
      <span className="vl margin-x-105 border-right-base" />
      <span className="text-base">{getCurrentDateInNewJersey().format("MMMM DD, YYYY")}</span>{" "}
      <span className="text-base">{Config.headerDefaults.newJerseyDateBodyText}</span>
    </div>
  );
};
