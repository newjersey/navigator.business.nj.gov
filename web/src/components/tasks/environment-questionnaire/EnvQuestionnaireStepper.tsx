import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import {
  mediaAreaToNotApplicableOption,
  mediaAreaToStepNumber,
  stepNumberToMediaArea,
} from "@/components/tasks/environment-questionnaire/helpers";

import { EnvPermitContext } from "@/contexts/EnvPermitContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { scrollToTop, templateEval } from "@/lib/utils/helpers";
import {
  MediaArea,
  Questionnaire,
  QuestionnaireConfig,
  QuestionnaireData,
  QuestionnaireFieldIds,
} from "@businessnjgovnavigator/shared/environment";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Link,
  useMediaQuery,
} from "@mui/material";
import { ChangeEvent, ReactElement, ReactNode, useContext } from "react";

export const EnvQuestionnaireStepper = (): ReactElement => {
  const { Config } = useConfig();
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const envContext = useContext(EnvPermitContext);

  const {
    isAuthenticated,
    setShowNeedsAccountModal,
    setShowContinueWithoutSaving,
    userWantsToContinueWithoutSaving,
  } = useContext(NeedsAccountContext);

  type EnvPermitStepNames =
    | "Instructions"
    | "Air"
    | "Land"
    | "Waste"
    | "Drinking Water"
    | "Waste Water";

  const EnvPermitConfiguration: {
    name: EnvPermitStepNames;
    stepIndex: number;
  }[] = [
    { name: "Instructions", stepIndex: 0 },
    { name: "Air", stepIndex: 1 },
    { name: "Land", stepIndex: 2 },
    { name: "Waste", stepIndex: 3 },
    { name: "Drinking Water", stepIndex: 4 },
    { name: "Waste Water", stepIndex: 5 },
  ];

  const steps = EnvPermitConfiguration.map((step) => {
    return {
      name: step.name,
      hasError: envContext.state.submitted
        ? envContext.mediaAreasWithErrors().includes(stepNumberToMediaArea[step.stepIndex])
        : undefined,
    };
  });

  let mediaArea: MediaArea | undefined;
  let optionsTextConfig: QuestionnaireConfig;
  let questionnaireFieldIds;

  if (envContext.state.stepIndex !== 0) {
    mediaArea = stepNumberToMediaArea[envContext.state.stepIndex] as MediaArea;

    optionsTextConfig = Config.envQuestionPage[mediaArea]
      .questionnaireOptions as QuestionnaireConfig;

    questionnaireFieldIds = Object.keys(optionsTextConfig);
  }

  const instructionsTab = (): ReactNode => (
    <div>
      <div className={"text-bold"}>{Config.envQuestionPage.instructions.lineOne}</div>
      <div> {Config.envQuestionPage.instructions.lineTwo}</div>
      <div> {Config.envQuestionPage.instructions.lineThree}</div>
      <hr className={"margin-y-2"} />
    </div>
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (mediaArea === undefined) return;
    const value: QuestionnaireFieldIds = event.target.id as QuestionnaireFieldIds;
    const noSelectionOption = mediaAreaToNotApplicableOption[mediaArea];

    if (value === noSelectionOption) {
      if (envContext.setQuestionnaireData) {
        envContext.setQuestionnaireData((prevData) => ({
          ...prevData,
          [mediaArea]: {
            [value]: event.target.checked,
          },
        }));
      }
    } else {
      if (envContext.setQuestionnaireData) {
        envContext.setQuestionnaireData((prevData: QuestionnaireData) => ({
          ...prevData,
          [mediaArea]: {
            ...prevData[mediaArea],
            [value]: event.target.checked,
            [noSelectionOption]: false,
          },
        }));
      }
    }
  };

  return (
    <div className={"bg-accent-cooler-50 padding-2 radius-lg"}>
      {!isMobile && (
        <h2 className="margin-bottom-neg-2 font-normal">{Config.envQuestionPage.generic.title}</h2>
      )}
      <HorizontalStepper
        steps={steps}
        currentStep={envContext.state.stepIndex}
        onStepClicked={(newStep) => {
          if (
            envContext.state.stepIndex === 0 &&
            isAuthenticated === IsAuthenticated.FALSE &&
            userWantsToContinueWithoutSaving === false
          ) {
            setShowContinueWithoutSaving(true);
            setShowNeedsAccountModal(true);
            return;
          }
          envContext.setStepIndex(newStep);
        }}
        inlineDialog
        environmentPermit
      />
      {envContext.mediaAreasWithErrors().length > 0 && envContext.state.submitted && (
        <Alert variant="error" dataTestid={"stepper-error-alert"}>
          <div>{Config.envQuestionPage.generic.errorText}</div>
          <ul>
            {envContext.mediaAreasWithErrors().map((mediaArea) => (
              <li key={mediaArea}>
                {
                  <Link
                    onClick={() => {
                      envContext.setStepIndex(mediaAreaToStepNumber[mediaArea]);
                    }}
                  >
                    {Config.envResultsPage.summary.mediaAreaText[mediaArea]}
                  </Link>
                }
              </li>
            ))}
          </ul>
        </Alert>
      )}
      {envContext.state.stepIndex === 0 ? (
        instructionsTab()
      ) : (
        <>
          <FormControl
            component="fieldset"
            variant="standard"
            fullWidth={true}
            data-testid={`${mediaArea}-questionnaire`}
          >
            <FormLabel component="legend" className="text-base-darkest text-bold">
              {Config.envQuestionPage.generic.question}
            </FormLabel>
            <FormGroup className={`margin-y-1 ${isMobile ? "" : "margin-left-105"}`}>
              {questionnaireFieldIds?.map((fieldId) => {
                return (
                  <FormControlLabel
                    key={fieldId}
                    control={
                      <Checkbox
                        checked={
                          mediaArea
                            ? (envContext.state.questionnaireData[mediaArea] as Questionnaire)?.[
                                fieldId as QuestionnaireFieldIds
                              ]
                            : false
                        }
                        onChange={handleChange}
                        name={fieldId}
                        id={fieldId}
                        key={fieldId}
                        data-testid={fieldId}
                      />
                    }
                    label={
                      <Content>{optionsTextConfig?.[fieldId as QuestionnaireFieldIds]}</Content>
                    }
                  />
                );
              })}
            </FormGroup>
          </FormControl>
          <div className={"margin-bottom-1"}>
            <Content>
              {templateEval(Config.envQuestionPage.generic.footerText, {
                mediaAreaText: mediaArea ? Config.envQuestionPage[mediaArea].mediaAreaText : "",
                mediaAreaLink: mediaArea ? Config.envQuestionPage[mediaArea].mediaAreaLink : "",
              })}
            </Content>
          </div>
          <hr className={"margin-y-2"} />
        </>
      )}

      <div className={"flex flex-row flex-justify-end"}>
        {envContext.state.stepIndex !== 0 && (
          <UnStyledButton
            isBgTransparent
            onClick={() => {
              envContext.setStepIndex(envContext.state.stepIndex - 1);
            }}
            className={"text-accent-cooler-600 margin-right-2"}
            isTextBold
          >
            {Config.envQuestionPage.generic.backButtonText}
          </UnStyledButton>
        )}
        <PrimaryButton
          isRightMarginRemoved
          isColor="accent-cooler"
          onClick={() => {
            if (
              envContext.state.stepIndex === 0 &&
              isAuthenticated === IsAuthenticated.FALSE &&
              userWantsToContinueWithoutSaving === false
            ) {
              setShowContinueWithoutSaving(true);
              setShowNeedsAccountModal(true);
              return;
            }
            if (envContext.state.stepIndex < 5) {
              envContext.setStepIndex(envContext.state.stepIndex + 1);
            }
            if (envContext.state.stepIndex === 5) {
              envContext.setSubmitted(true);
              if (envContext.mediaAreasWithErrors().length > 0) {
                scrollToTop({ smooth: true });
                envContext.setStepIndex(0);
              } else {
                envContext.onSubmit?.();
              }
            }
          }}
        >
          {envContext.state.stepIndex === 0
            ? Config.envQuestionPage.generic.startText
            : Config.envQuestionPage.generic.buttonText}
        </PrimaryButton>
      </div>
    </div>
  );
};
