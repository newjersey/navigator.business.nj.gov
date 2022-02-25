import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import { useRouter } from "next/router";
import React, { ReactElement } from "react";

export const GraduationBox = (): ReactElement => {
  const { userData, update } = useUserData();
  const router = useRouter();

  const graduateToOwning = async (): Promise<void> => {
    if (!userData) return;
    await update({
      ...userData,
      profileData: {
        ...userData.profileData,
        hasExistingBusiness: true,
      },
    });
    await router.push("/onboarding");
  };

  return (
    <div className="padding-3 bg-base-lightest radius-md fdr fac">
      <div>
        <img
          src={`/img/congratulations-green.svg`}
          style={{ width: "60px", height: "60px" }}
          className="margin-right-3"
          alt=""
        />
      </div>
      <div>
        <h3>{Defaults.roadmapDefaults.graduationHeader}</h3>
        <p className="margin-bottom-1 text-base-dark">{Defaults.roadmapDefaults.graduationBodyText}</p>
      </div>
      <div className="mla">
        <Button style="primary" onClick={graduateToOwning}>
          {Defaults.roadmapDefaults.graduationButtonText}
        </Button>
      </div>
    </div>
  );
};
