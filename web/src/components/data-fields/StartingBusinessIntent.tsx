import React, { ReactElement, useState } from "react";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { FormContextFieldProps } from "@businessnjgovnavigator/shared/types";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";

export const StartingBusinessIntent = <T,>(props: FormContextFieldProps<T>): ReactElement => {
  const { Config } = useConfig();
  const [isLearningBusiness] = useState<boolean | undefined>(undefined);
  const { userData, updateQueue } = useUserData();

  const { RegisterForOnSubmit, setIsValid } = useFormContextFieldHelpers(
    "onboardedAsLearningUser",
    DataFormErrorMapContext,
    props.errorTypes,
  );

  RegisterForOnSubmit(() => {
    return userData?.user.onboardedAsLearningUser !== undefined;
  });

  const handleSelection = async (
    event: React.ChangeEvent<{ name?: string; value: unknown }>,
  ): Promise<void> => {
    setIsValid(true);
    const value = event.target.value;
    await updateQueue
      ?.queueUser({
        onboardedAsLearningUser: value === "true",
      })
      .update();
  };

  return (
    <div className={"padding-y-5"}>
      <FormControl fullWidth>
        <RadioGroup
          name={"learning-business-question"}
          value={isLearningBusiness}
          onChange={handleSelection}
          row
        >
          <div className={"max-width-half"}>
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid="starting-ready-business"
              value={false}
              control={<Radio color="primary" />}
              label={
                <>
                  <div className={"text-bold"}>
                    {
                      Config.onboardingDefaults.startingBusinessIntent.default
                        .radioButtonReadyHeaderText
                    }
                  </div>
                  {Config.onboardingDefaults.startingBusinessIntent.default.radioButtonReadyText}
                </>
              }
            />
          </div>
          <div className={"max-width-half"}>
            <FormControlLabel
              style={{ alignItems: "center" }}
              labelPlacement="end"
              data-testid="starting-learning-business"
              value={true}
              control={<Radio color="primary" />}
              label={
                <>
                  <div className={"text-bold"}>
                    {
                      Config.onboardingDefaults.startingBusinessIntent.default
                        .radioButtonLearningHeaderText
                    }
                  </div>
                  {Config.onboardingDefaults.startingBusinessIntent.default.radioButtonLearningText}
                </>
              }
            />
          </div>
        </RadioGroup>
      </FormControl>
    </div>
  );
};
