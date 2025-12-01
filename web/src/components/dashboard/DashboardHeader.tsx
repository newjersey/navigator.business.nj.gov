import { Heading } from "@/components/njwds-extended/Heading";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval } from "@/lib/utils/helpers";
import { isStartingBusiness } from "@businessnjgovnavigator/shared/domain-logic/businessPersonaHelpers";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { ReactElement, useContext } from "react";

export const DashboardHeader = (): ReactElement => {
  const { state } = useContext(AuthContext);
  const { Config } = useConfig();
  const { business, userData } = useUserData();

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
  return (
    <>
      <div className="margin-bottom-4" data-testid="dashboard-header">
        <Heading level={1} className={`margin-top-0 break-word`}>
          {getHeader()}
        </Heading>
      </div>
    </>
  );
};
