import { Content } from "@/components/Content";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React, { ReactElement } from "react";

export const MicrobusinessRadioQuestion = (): ReactElement<any> => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();

  const handleRadioChange = async (
    event: React.ChangeEvent<{ name?: string; value: string }>
  ): Promise<void> => {
    if (!business || !updateQueue) return;
    const isMicrobusiness = event.target.value === "true";
    await updateQueue
      .queueProfileData({
        cannabisMicrobusiness: isMicrobusiness,
      })
      .update();

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
          value={business?.profileData.cannabisMicrobusiness ?? ""}
          onChange={handleRadioChange}
          row
        >
          <FormControlLabel
            style={{ alignItems: "center" }}
            labelPlacement="end"
            data-testid="microbusiness-radio-true"
            value={true}
            control={<Radio color="primary" />}
            label={<Content>{Config.cannabisApplyForLicense.microbusinessRadioYes}</Content>}
          />
          <FormControlLabel
            style={{ alignItems: "center" }}
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
