import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import { Checkbox, FormControl, FormControlLabel, FormGroup } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onCheckboxChange: (checkbox: PriorityApplicationType, checked: boolean) => void;
}

export const PriorityStatusCheckboxes = (props: Props): ReactElement => {
  const [eligibleModalIsOpenWith, setEligibleModalIsOpenWith] = useState<PriorityApplicationType | "">("");

  const { userData } = useUserData();
  const { Config } = useConfig();

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>, type: PriorityApplicationType) => {
    if (!userData) {
      return;
    }
    if (event.target.checked) {
      setEligibleModalIsOpenWith(type);
    } else {
      props.onCheckboxChange(type, false);
    }
  };

  const setEligibilityChecked = () => {
    if (eligibleModalIsOpenWith === "") {
      return;
    }
    props.onCheckboxChange(eligibleModalIsOpenWith, true);
    setEligibleModalIsOpenWith("");
  };

  return (
    <>
      <ul>
        <FormGroup>
          <FormControl variant="outlined" fullWidth>
            <FormControlLabel
              className="margin-y-1"
              label={<Content>{Config.cannabisApplyForLicense.diverselyOwnedLabel}</Content>}
              control={
                <Checkbox
                  name="diversely-owned-checkbox"
                  onChange={(event) => {
                    return handleCheckbox(event, "diverselyOwned");
                  }}
                  checked={props.priorityStatusState.diverselyOwned}
                  sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px", paddingLeft: "0px" }}
                  data-testid="diversely-owned-checkbox"
                />
              }
            />
            <FormControlLabel
              className="margin-y-1"
              label={<Content>{Config.cannabisApplyForLicense.impactZoneLabel}</Content>}
              control={
                <Checkbox
                  onChange={(event) => {
                    return handleCheckbox(event, "impactZone");
                  }}
                  checked={props.priorityStatusState.impactZone}
                  sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px", paddingLeft: "0px" }}
                  data-testid="impact-zone-checkbox"
                />
              }
            />
            <FormControlLabel
              className="margin-y-1"
              label={<Content>{Config.cannabisApplyForLicense.sbeLabel}</Content>}
              control={
                <Checkbox
                  onChange={(event) => {
                    return handleCheckbox(event, "socialEquity");
                  }}
                  checked={props.priorityStatusState.socialEquity}
                  sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px", paddingLeft: "0px" }}
                  data-testid="sbe-checkbox"
                />
              }
            />
          </FormControl>{" "}
        </FormGroup>
      </ul>

      <ModalTwoButton
        isOpen={eligibleModalIsOpenWith !== ""}
        close={() => {
          return setEligibleModalIsOpenWith("");
        }}
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
