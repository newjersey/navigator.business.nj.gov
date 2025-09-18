import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { WithErrorBar } from "@/components/WithErrorBar";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Checkbox, FormControlLabel } from "@mui/material";
import { ReactElement, useContext } from "react";

export const ReviewConfirmation = (): ReactElement => {
  const { state, setReviewCheckboxes, allConfirmationsChecked } =
    useContext(BusinessFormationContext);
  const { Config } = useConfig();

  return (
    <div className="margin-top-4">
      <div className="bg-base-lightest padding-x-5 padding-y-3 radius-md">
        <Heading level={2}>{Config.formation.sections.review.confirmationBox.title}</Heading>

        <WithErrorBar hasError={!allConfirmationsChecked() && state.hasBeenSubmitted} type="ALWAYS">
          <div data-testid="names-addresses-dates-checkbox-container">
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.reviewCheckboxes.namesAddressesDatesChecked}
                  onChange={(event): void =>
                    setReviewCheckboxes((prev) => ({
                      ...prev,
                      namesAddressesDatesChecked: event.target.checked,
                    }))
                  }
                  {...(state.hasBeenSubmitted && !state.reviewCheckboxes.namesAddressesDatesChecked
                    ? { color: "error" }
                    : {})}
                />
              }
              label={
                <Content>
                  {Config.formation.sections.review.confirmationBox.namesAddressesDatesCheckbox}
                </Content>
              }
            />
          </div>

          <div data-testid="permanent-record-checkbox-container">
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.reviewCheckboxes.permanentRecordChecked}
                  onChange={(event): void =>
                    setReviewCheckboxes((prev) => ({
                      ...prev,
                      permanentRecordChecked: event.target.checked,
                    }))
                  }
                  {...(state.hasBeenSubmitted && !state.reviewCheckboxes.permanentRecordChecked
                    ? { color: "error" }
                    : {})}
                />
              }
              label={
                <Content>
                  {Config.formation.sections.review.confirmationBox.permanentRecordCheckbox}
                </Content>
              }
            />
          </div>

          <div data-testid="correction-fees-checkbox-container">
            <FormControlLabel
              control={
                <Checkbox
                  checked={state.reviewCheckboxes.correctionFeesChecked}
                  onChange={(event): void =>
                    setReviewCheckboxes((prev) => ({
                      ...prev,
                      correctionFeesChecked: event.target.checked,
                    }))
                  }
                  {...(state.hasBeenSubmitted && !state.reviewCheckboxes.correctionFeesChecked
                    ? { color: "error" }
                    : {})}
                />
              }
              label={
                <Content>
                  {Config.formation.sections.review.confirmationBox.correctionFeesCheckbox}
                </Content>
              }
            />
          </div>

          {!allConfirmationsChecked() && state.hasBeenSubmitted && (
            <div className="text-error-dark text-bold">
              <Content>
                {Config.formation.sections.review.confirmationBox.confirmationError}
              </Content>
            </div>
          )}
        </WithErrorBar>
      </div>
    </div>
  );
};
