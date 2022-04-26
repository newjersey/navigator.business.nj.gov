import { Content } from "@/components/Content";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement } from "react";

export const MicrobusinessRadioQuestion = (): ReactElement => {
  const { userData, update } = useUserData();

  const handleRadioChange = async (
    event: React.ChangeEvent<{ readonly name?: string; readonly value: string }>
  ) => {
    if (!userData) return;
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
      <div className="margin-bottom-2">
        <Content>{Config.cannabisApplyForLicense.microbusinessRadioQuestion}</Content>
      </div>
      <FormControl variant="outlined" fullWidth>
        <RadioGroup
          aria-label={Config.cannabisApplyForLicense.microbusinessRadioQuestion}
          name="cannabis-microbusiness"
          value={userData?.profileData.cannabisMicrobusiness ?? ""}
          onChange={handleRadioChange}
          row
        >
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="microbusiness-radio-true"
            value={true}
            control={<Radio color="primary" />}
            label={<Content>{Config.cannabisApplyForLicense.microbusinessRadioYes}</Content>}
          />
          <FormControlLabel
            style={{ marginRight: "3rem" }}
            labelPlacement="end"
            data-testid="microbusiness-radio-false"
            value={false}
            control={<Radio color="primary" />}
            label={<Content>{Config.cannabisApplyForLicense.microbusinessRadioNo}</Content>}
          />
        </RadioGroup>
      </FormControl>
    </>
  );
};
