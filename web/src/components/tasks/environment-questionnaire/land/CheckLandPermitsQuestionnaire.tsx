import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { LandQuestionnaireData, LandQuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";
import { Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel } from "@mui/material";
import { ChangeEvent, ReactElement, useContext, useState } from "react";

interface Props {
  task: Task;
}

export const CheckLandPermitsQuestionnaire = (props: Props): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const [showError, setShowError] = useState<boolean>(false);
  const [landQuestionnaireData, setLandData] = useState<LandQuestionnaireData>({
    takeOverExistingBiz: business?.environmentData?.land?.questionnaireData?.takeOverExistingBiz ?? false,
    propertyAssessment: business?.environmentData?.land?.questionnaireData?.propertyAssessment ?? false,
    constructionActivities:
      business?.environmentData?.land?.questionnaireData?.constructionActivities ?? false,
    siteImprovementWasteLands:
      business?.environmentData?.land?.questionnaireData?.siteImprovementWasteLands ?? false,
    noLand: business?.environmentData?.land?.questionnaireData?.noLand ?? false,
  });
  const wasteQuestionnaireFieldIds = Object.keys(landQuestionnaireData);

  const noSelectionMade = (landQuestionnaireData: LandQuestionnaireData): boolean => {
    for (const field in landQuestionnaireData) {
      if (landQuestionnaireData[field as LandQuestionnaireFieldIds]) {
        return false;
      }
    }
    return true;
  };

  const onSave = (landQuestionnaireData: LandQuestionnaireData): void => {
    if (noSelectionMade(landQuestionnaireData)) {
      setShowError(true);
    } else {
      updateQueue
        ?.queueEnvironmentData({
          land: {
            questionnaireData: landQuestionnaireData,
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
    const value: LandQuestionnaireFieldIds = event.target.id as LandQuestionnaireFieldIds;
    if (value === "noLand") {
      setLandData({
        takeOverExistingBiz: false,
        propertyAssessment: false,
        constructionActivities: false,
        siteImprovementWasteLands: false,
        noLand: event.target.checked,
      });
    } else {
      setLandData({
        ...landQuestionnaireData,
        [value]: event.target.checked,
        noLand: landQuestionnaireData.noLand ? false : landQuestionnaireData.noLand,
      });
    }
  };

  return (
    <div className={"bg-base-extra-light padding-205 radius-lg"}>
      <h3>{Config.envReqQuestionsPage.generic.title}</h3>
      {showError && <Alert variant={"error"}>{Config.envReqQuestionsPage.generic.errorText}</Alert>}
      <FormControl component="fieldset" variant="standard">
        <FormLabel component="legend" className="text-base-darkest text-bold">
          {Config.envReqQuestionsPage.generic.question}
        </FormLabel>
        <FormGroup className={"margin-y-1 margin-left-105"}>
          {wasteQuestionnaireFieldIds.map((fieldId) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={landQuestionnaireData[fieldId as LandQuestionnaireFieldIds]}
                    onChange={handleChange}
                    name={fieldId}
                    id={fieldId}
                  />
                }
                label={
                  <Content>
                    {
                      Config.envReqQuestionsPage.land.questionnaireOptions[
                        fieldId as LandQuestionnaireFieldIds
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
        <Content>{Config.envReqQuestionsPage.land.footer}</Content>
      </div>
      <div className={"flex flex-row flex-justify-end"}>
        <SecondaryButton isColor="accent-cooler" onClick={() => onSave(landQuestionnaireData)}>
          {Config.envReqQuestionsPage.generic.buttonText}
        </SecondaryButton>
      </div>
    </div>
  );
};
