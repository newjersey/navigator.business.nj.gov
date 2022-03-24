import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { setAnalyticsDimensions } from "@/lib/utils/analytics-helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";

export const UnGraduationBox = (): ReactElement => {
  const { userData, update } = useUserData();
  const router = useRouter();

  const ungraduateToStarting = async (): Promise<void> => {
    if (!userData) return;
    const newProfileData = {
      ...userData.profileData,
      hasExistingBusiness: false,
    };
    setAnalyticsDimensions(newProfileData);
    analytics.event.dashboard_ungraduate_button.click.existing_dashboard_to_prospective_roadmap();
    await update({
      ...userData,
      profileData: newProfileData,
    });

    await router.push("/roadmap");
  };

  return (
    <div>
      <div className="margin-top-6">
        <div className="padding-3 bg-base-lightest radius-md">
          <h2 className="h3-styling margin-bottom-105">{Config.dashboardDefaults.backToRoadmapHeader}</h2>
          <p className="text-base-dark">
            {Config.dashboardDefaults.backToRoadmapText.split("${link}")[0]}
            <Button style="tertiary" underline widthAutoOnMobile onClick={ungraduateToStarting}>
              {Config.dashboardDefaults.backToRoadmapLinkText}
            </Button>
            {Config.dashboardDefaults.backToRoadmapText.split("${link}")[1]}
          </p>
        </div>
      </div>
    </div>
  );
};
