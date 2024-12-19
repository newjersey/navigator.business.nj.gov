import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onCheckboxChange: (checkbox: PriorityApplicationType, checked: boolean) => void;
}

export const PriorityStatusCheckboxes = (props: Props): ReactElement<any> => {
  const [eligibleModalIsOpenWith, setEligibleModalIsOpenWith] = useState<PriorityApplicationType | "">("");

  const { Config } = useConfig();

  const handleCheckbox = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: PriorityApplicationType
  ): void => {
    if (event.target.checked) {
      setEligibleModalIsOpenWith(type);
    } else {
      props.onCheckboxChange(type, false);
    }
  };

  const setEligibilityChecked = (): void => {
    if (eligibleModalIsOpenWith === "") {
      return;
    }
    props.onCheckboxChange(eligibleModalIsOpenWith, true);
    setEligibleModalIsOpenWith("");
  };

  return (
    <>
      <FormGroup>
        <FormControl variant="outlined" fullWidth>
          <FormControlLabel
            label={<Content>{Config.cannabisApplyForLicense.diverselyOwnedLabel}</Content>}
            control={
              <Checkbox
                name="diversely-owned-checkbox"
                onChange={(event): void => handleCheckbox(event, "diverselyOwned")}
                checked={props.priorityStatusState.diverselyOwned}
                data-testid="diversely-owned-checkbox"
              />
            }
          />
          <FormControlLabel
            label={<Content>{Config.cannabisApplyForLicense.impactZoneLabel}</Content>}
            control={
              <Checkbox
                onChange={(event): void => handleCheckbox(event, "impactZone")}
                checked={props.priorityStatusState.impactZone}
                data-testid="impact-zone-checkbox"
              />
            }
          />
          <FormControlLabel
            label={<Content>{Config.cannabisApplyForLicense.sbeLabel}</Content>}
            control={
              <Checkbox
                onChange={(event): void => handleCheckbox(event, "socialEquity")}
                checked={props.priorityStatusState.socialEquity}
                data-testid="sbe-checkbox"
              />
            }
          />
        </FormControl>
      </FormGroup>
      <ModalTwoButton
        isOpen={eligibleModalIsOpenWith !== ""}
        close={(): void => setEligibleModalIsOpenWith("")}
        title={Config.cannabisEligibilityModal.eligibleModalTitle}
        primaryButtonText={Config.cannabisEligibilityModal.eligibleModalContinueButton}
        primaryButtonOnClick={setEligibilityChecked}
        secondaryButtonText={Config.cannabisEligibilityModal.eligibleModalCancelButton}
      >
        <Content>{Config.cannabisEligibilityModal.eligibleModalBody}</Content>
      </ModalTwoButton>
    </>
  );
};
