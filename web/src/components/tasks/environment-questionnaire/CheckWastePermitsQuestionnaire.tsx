import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import {
  WasteQuestionnaireData,
  WasteQuestionnaireFieldIds,
} from "@businessnjgovnavigator/shared/environment";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";
import { ChangeEvent, ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
}

export const CheckWastePermitsQuestionnaire = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const [showError, setShowError] = useState<boolean>(false);
  const [wasteQuestionnaireData, setWasteData] = useState<WasteQuestionnaireData>({
    hazardousMedicalWaste:
      business?.environmentData?.waste?.questionnaireData?.hazardousMedicalWaste ?? false,
    compostWaste: business?.environmentData?.waste?.questionnaireData?.compostWaste ?? false,
    treatProcessWaste: business?.environmentData?.waste?.questionnaireData?.treatProcessWaste ?? false,
    constructionDebris: business?.environmentData?.waste?.questionnaireData?.constructionDebris ?? false,
    noWaste: business?.environmentData?.waste?.questionnaireData?.noWaste ?? false,
  });
  const wasteQuestionnaireFieldIds = Object.keys(wasteQuestionnaireData);

  const noSelectionMade = (wasteQuestionnaireData: WasteQuestionnaireData): boolean => {
    for (const field in wasteQuestionnaireData) {
      if (wasteQuestionnaireData[field as WasteQuestionnaireFieldIds]) {
        return false;
      }
    }
    return true;
  };

  const onSave = (wasteQuestionnaireData: WasteQuestionnaireData): void => {
    if (noSelectionMade(wasteQuestionnaireData)) {
      setShowError(true);
    } else {
      updateQueue
        ?.queueEnvironmentData({
          waste: {
            questionnaireData: wasteQuestionnaireData,
            submitted: true,
          },
        })
        .queueTaskProgress({
          [props.task.id]: "COMPLETED",
        })
        .update();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      setShowNeedsAccountModal(true);
      return;
    }
    const value: WasteQuestionnaireFieldIds = event.target.id as WasteQuestionnaireFieldIds;
    if (value === "noWaste") {
      setWasteData({
        hazardousMedicalWaste: false,
        compostWaste: false,
        treatProcessWaste: false,
        constructionDebris: false,
        noWaste: event.target.checked,
      });
    } else {
      setWasteData({
        ...wasteQuestionnaireData,
        [value]: event.target.checked,
        noWaste: wasteQuestionnaireData.noWaste ? false : wasteQuestionnaireData.noWaste,
      });
    }
  };

  return (
    <div className={"bg-base-extra-light padding-205 radius-lg"}>
      <h3>{Config.wasteQuestionnaireQuestionsPage.title}</h3>
      {showError && <Alert variant={"error"}>{Config.wasteQuestionnaireQuestionsPage.errorText}</Alert>}
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend" className="text-base-darkest text-bold">
          {Config.wasteQuestionnaireQuestionsPage.question}
        </FormLabel>
        <FormGroup className={"margin-y-1 margin-left-105"}>
          {wasteQuestionnaireFieldIds.map((fieldId) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={wasteQuestionnaireData[fieldId as WasteQuestionnaireFieldIds]}
                    onChange={handleChange}
                    name={fieldId}
                    id={fieldId}
                  />
                }
                label={
                  <Content>
                    {
                      Config.wasteQuestionnaireQuestionsPage.wasteQuestionnaireOptions[
                        fieldId as WasteQuestionnaireFieldIds
                      ]
                    }
                  </Content>
                }
                key={fieldId}
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <div className={"margin-bottom-1"}>
        <Content>{Config.wasteQuestionnaireQuestionsPage.footer}</Content>
      </div>
      <div className={"flex flex-row flex-justify-end"}>
        <SecondaryButton isColor="accent-cooler" onClick={() => onSave(wasteQuestionnaireData)}>
          {Config.wasteQuestionnaireQuestionsPage.buttonText}
        </SecondaryButton>
      </div>
    </div>
  );
};
