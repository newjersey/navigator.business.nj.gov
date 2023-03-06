import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement } from "react";

export const MicrobusinessRadioQuestion = (): ReactElement => {
  const { userData, update } = useUserData();
  const { Config } = useConfig();

  const handleRadioChange = async (event: React.ChangeEvent<{ name?: string; value: string }>) => {
    if (!userData) {
      return;
    }
    const isMicrobusiness = event.target.value === "true";
    await update({
      ...userData,
      profileData: {
        ...userData.profileData,
        cannabisMicrobusiness: isMicrobusiness,
      },
    });

    if (isMicrobusiness) {
      analytics.event.cannabis_license_form_microbusiness_question.submit.yes_I_m_a_microbusiness();
    } else {
      analytics.event.cannabis_license_form_microbusiness_question.submit.no_I_m_a_standard_business();
    }
  };

  return (
    <>
      <Content>{Config.cannabisApplyForLicense.microbusinessRadioQuestion}</Content>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label={Config.cannabisApplyForLicense.microbusinessRadioQuestion}
          name="cannabis-microbusiness"
          value={userData?.profileData.cannabisMicrobusiness ?? ""}
          onChange={handleRadioChange}
          row
        >
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="microbusiness-radio-true"
            value={true}
            control={<Radio color="primary" />}
            label={
              <div className="padding-y-1 margin-right-3">
                <Content>{Config.cannabisApplyForLicense.microbusinessRadioYes}</Content>{" "}
              </div>
            }
          />
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="microbusiness-radio-false"
            value={false}
            control={<Radio color="primary" />}
            label={
              <div className="padding-y-1 margin-right-3">
                <Content>{Config.cannabisApplyForLicense.microbusinessRadioNo}</Content>{" "}
              </div>
            }
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};
