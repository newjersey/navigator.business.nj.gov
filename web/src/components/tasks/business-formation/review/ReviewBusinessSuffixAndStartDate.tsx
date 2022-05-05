import { Content } from "@/components/Content";
import { FormationContext } from "@/components/tasks/business-formation/BusinessFormation";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import React, { ReactElement, useContext } from "react";

export const ReviewBusinessSuffixAndStartDate = (): ReactElement => {
  const { state } = useContext(FormationContext);
  const { userData } = useUserData();

  return (
    <>
      <div className="display-block tablet:display-flex">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageBusinessSuffixLabel}</Content>
        </div>
        <div>
          {userData?.profileData.businessName} {state.formationFormData.businessSuffix}
        </div>
      </div>
      <div className="display-block tablet:display-flex margin-top-1">
        <div className="text-bold width-11rem">
          <Content>{Config.businessFormationDefaults.reviewPageBusinessStartDateLabel}</Content>
        </div>
        <div>
          {parseDateWithFormat(state.formationFormData.businessStartDate, "YYYY-MM-DD").format("MM/DD/YYYY")}
        </div>
      </div>
      <hr className="margin-y-205" />
    </>
  );
};
