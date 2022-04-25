import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { PriorityApplicationType } from "@/lib/domain-logic/cannabisPriorityTypes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Checkbox, FormControl, FormControlLabel } from "@mui/material";
import React, { ReactElement, useState } from "react";

interface Props {
  priorityStatusState: Record<PriorityApplicationType, boolean>;
  onCheckboxChange: (checkbox: PriorityApplicationType, checked: boolean) => void;
}

export const PriorityStatusCheckboxes = (props: Props): ReactElement => {
  const [eligibleModalIsOpenWith, setEligibleModalIsOpenWith] = useState<PriorityApplicationType | "">("");

  const { userData } = useUserData();

  const handleCheckbox = (event: React.ChangeEvent<HTMLInputElement>, type: PriorityApplicationType) => {
    if (!userData) return;
    if (event.target.checked) {
      setEligibleModalIsOpenWith(type);
    } else {
      props.onCheckboxChange(type, false);
    }
  };

  const setEligibilityChecked = () => {
    if (eligibleModalIsOpenWith === "") return;
    props.onCheckboxChange(eligibleModalIsOpenWith, true);
    setEligibleModalIsOpenWith("");
  };

  return (
    <>
      <ul>
        <FormControl variant="outlined" fullWidth>
          <FormControlLabel
            className="margin-y-1"
            label={<Content>{Config.cannabisApplyForLicense.diverselyOwnedLabel}</Content>}
            control={
              <Checkbox
                name="diversely-owned-checkbox"
                onChange={(event) => handleCheckbox(event, "diverselyOwned")}
                checked={props.priorityStatusState.diverselyOwned}
                sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px" }}
                data-testid="diversely-owned-checkbox"
              />
            }
          />
          <FormControlLabel
            className="margin-y-1"
            label={<Content>{Config.cannabisApplyForLicense.impactZoneLabel}</Content>}
            control={
              <Checkbox
                onChange={(event) => handleCheckbox(event, "impactZone")}
                checked={props.priorityStatusState.impactZone}
                sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px" }}
                data-testid="impact-zone-checkbox"
              />
            }
          />
          <FormControlLabel
            className="margin-y-1"
            label={<Content>{Config.cannabisApplyForLicense.sbeLabel}</Content>}
            control={
              <Checkbox
                onChange={(event) => handleCheckbox(event, "socialEquity")}
                checked={props.priorityStatusState.socialEquity}
                sx={{ alignSelf: "start", paddingTop: "1px", paddingBottom: "0px" }}
                data-testid="sbe-checkbox"
              />
            }
          />
        </FormControl>
      </ul>

      <DialogTwoButton
        isOpen={eligibleModalIsOpenWith !== ""}
        close={() => setEligibleModalIsOpenWith("")}
        title={Config.cannabisApplyForLicense.eligibleModalTitle}
        primaryButtonText={Config.cannabisApplyForLicense.eligibleModalContinueButton}
        primaryButtonOnClick={setEligibilityChecked}
        // primaryButtonOnClick={eligibleModalSetter ? () => eligibleModalSetter() : () => {}}
        secondaryButtonText={Config.cannabisApplyForLicense.eligibleModalCancelButton}
      >
        <Content>{Config.cannabisApplyForLicense.eligibleModalBody}</Content>
      </DialogTwoButton>
    </>
  );
};
