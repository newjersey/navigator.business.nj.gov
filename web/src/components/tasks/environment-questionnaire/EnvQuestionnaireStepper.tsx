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
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
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
  const { updateQueue } = useUserData();

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
    | "Wastewater";

  const EnvPermitConfiguration: {
    name: EnvPermitStepNames;
    stepIndex: number;
  }[] = [
    { name: "Instructions", stepIndex: 0 },
    { name: "Air", stepIndex: 1 },
    { name: "Land", stepIndex: 2 },
    { name: "Waste", stepIndex: 3 },
    { name: "Drinking Water", stepIndex: 4 },
    { name: "Wastewater", stepIndex: 5 },
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
      <div>
        {Config.envQuestionPage.instructions.lineTwoPtOne}
        <span className={"text-bold margin-x-05"}>
          {Config.envQuestionPage.instructions.lineTwoNotText}
        </span>
        {Config.envQuestionPage.instructions.lineTwoPtTwo}
      </div>
      <div> {Config.envQuestionPage.instructions.lineThree}</div>
      <hr className={"margin-y-2"} />
    </div>
  );

  const allOptionsAsFalse = (mediaArea: MediaArea): Record<QuestionnaireFieldIds, boolean> => {
    const mediaAreaOptions = Object.keys(Config.envQuestionPage[mediaArea].questionnaireOptions);
    const allOptionsAsFalse = {} as Record<QuestionnaireFieldIds, boolean>;
    for (const option of mediaAreaOptions) {
      allOptionsAsFalse[option as QuestionnaireFieldIds] = false;
    }
    return allOptionsAsFalse;
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (mediaArea === undefined) return;
    const value: QuestionnaireFieldIds = event.target.id as QuestionnaireFieldIds;
    const noSelectionOption = mediaAreaToNotApplicableOption[mediaArea];

    if (value === noSelectionOption) {
      if (envContext.setQuestionnaireData) {
        envContext.setQuestionnaireData((prevData) => ({
          ...prevData,
          [mediaArea]: {
            ...allOptionsAsFalse(mediaArea),
            [noSelectionOption]: event.target.checked,
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

  const handleOnStepClick = (newStep: number): void => {
    const category = EnvPermitConfiguration.find((s) => newStep === s.stepIndex);

    if (!category) return;

    const categoryName = category.name.toLowerCase().split(" ").join("_");
    analytics.event.gen_guidance_stepper_step_category.click.general_guidance_step(
      newStep,
      categoryName,
    );

    const userNotAuthandDoesntWantToSave =
      envContext.state.stepIndex === 0 &&
      isAuthenticated === IsAuthenticated.FALSE &&
      userWantsToContinueWithoutSaving === false;

    if (userNotAuthandDoesntWantToSave) {
      updateQueue?.queuePreferences({ returnToLink: ROUTES.envPermit }).update();
      setShowContinueWithoutSaving(true);
      setShowNeedsAccountModal(true);
    }
    envContext.setStepIndex(newStep);
  };

  const nextButtonText = (): string => {
    if (envContext.state.stepIndex === 0) return Config.envQuestionPage.generic.startingButtonText;
    if (envContext.state.stepIndex === 5) return Config.envQuestionPage.generic.endingButtonText;

    return Config.envQuestionPage.generic.buttonText;
  };

  return (
    <div className={"bg-accent-cooler-50 padding-2 radius-lg"}>
      <h2 className={`${isMobile ? `margin-bottom-neg-05` : `margin-bottom-neg-2`}`}>
        {Config.envQuestionPage.generic.title}
      </h2>
      <HorizontalStepper
        steps={steps}
        currentStep={envContext.state.stepIndex}
        onStepClicked={handleOnStepClick}
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
              updateQueue?.queuePreferences({ returnToLink: ROUTES.envPermit }).update();
              setShowContinueWithoutSaving(true);
              analytics.event.gen_guidance_stepper_save_modal_displayed.appears.general_guidance_save_modal_displayed();
              setShowNeedsAccountModal(true);
              envContext.setStepIndex(envContext.state.stepIndex + 1);
              return;
            }
            if (envContext.state.stepIndex < 5) {
              if (userWantsToContinueWithoutSaving === true && envContext.state.stepIndex === 1) {
                analytics.event.gen_guidance_stepper_continue_without_saving.click.general_guidance_continue_wo_saving();
              }

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
          {nextButtonText()}
        </PrimaryButton>
      </div>
    </div>
  );
};
