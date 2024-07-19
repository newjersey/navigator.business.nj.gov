import { Heading } from "@/components/njwds-extended/Heading";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { templateEval } from "@/lib/utils/helpers";
import { isStartingBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { getCurrentDateInNewJersey } from "@businessnjgovnavigator/shared/index";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared/legalStructure";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const DashboardHeader = (): ReactElement => {
  const { state } = useContext(AuthContext);
  const { Config } = useConfig();
  const { business, userData } = useUserData();
  const router = useRouter();

  const editOnClick = (): void => {
    analytics.event.roadmap_profile_edit_button.click.go_to_profile_screen();
    router.push(ROUTES.profile);
  };

  const getHeader = (): string => {
    if (state.isAuthenticated === IsAuthenticated.FALSE && isStartingBusiness(business)) {
      return business?.profileData.industryId === "generic"
        ? Config.dashboardHeaderDefaults.genericStarterKitText
        : templateEval(Config.dashboardHeaderDefaults.starterKitText, {
            industry: LookupIndustryById(business?.profileData.industryId).name,
          });
    }

    return userData?.user.name
      ? templateEval(Config.dashboardHeaderDefaults.defaultHeaderText, {
          name: userData.user.name,
        })
      : Config.dashboardHeaderDefaults.noUserNameHeaderText;
  };

  const getButtonText = (): string | undefined => {
    if (state.isAuthenticated === "FALSE" || state.isAuthenticated === "UNKNOWN") {
      return Config.dashboardHeaderDefaults.guestModeToProfileButtonText;
    }

    const businessName = LookupLegalStructureById(business?.profileData.legalStructureId).requiresPublicFiling
      ? business?.profileData.businessName
      : business?.profileData.tradeName;

    if (!businessName && state.isAuthenticated === "TRUE") {
      return Config.dashboardHeaderDefaults.genericToProfileButtonText;
    }

    if (businessName && state.isAuthenticated === "TRUE") {
      return businessName;
    }
  };
  return (
    <>
      <div className="margin-bottom-4">
        <Heading level={1} className={`margin-top-0 break-word`}>
          {getHeader()}
        </Heading>
        <UnStyledButton
          isUnderline
          isTextBold
          onClick={editOnClick}
          dataTestid="header-link-to-profile"
          ariaLabel="Link To Business Profile"
        >
          {getButtonText()}
        </UnStyledButton>
        <span className="vertical-line margin-x-105 border-right-base" />
        <span className="text-base">{getCurrentDateInNewJersey().format("MMMM DD, YYYY")}</span>{" "}
        <span className="text-base">{Config.dashboardHeaderDefaults.newJerseyDateBodyText}</span>
      </div>
    </>
  );
};
