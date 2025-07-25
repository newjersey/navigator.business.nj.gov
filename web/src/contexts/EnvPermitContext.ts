import {
  generateEmptyEnvironmentQuestionnaireData,
  MediaArea,
  QuestionnaireData,
} from "@businessnjgovnavigator/shared/environment";
import React, { createContext, FormEvent } from "react";

interface EnvPermitState {
  questionnaireData: QuestionnaireData;
  stepIndex: number;
  submitted: boolean;
}

interface EnvPermitContextType {
  state: EnvPermitState;
  setQuestionnaireData?: React.Dispatch<React.SetStateAction<QuestionnaireData>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  onSubmit?: (event?: FormEvent<HTMLFormElement>) => void;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  onClickForEdit: () => void;
  applicableMediaAreas: () => MediaArea[];
  mediaAreasWithErrors: () => MediaArea[];
}

export const EnvPermitContext = createContext<EnvPermitContextType>({
  state: {
    stepIndex: 0,
    questionnaireData: generateEmptyEnvironmentQuestionnaireData(),
    submitted: false,
  },
  setStepIndex: () => {},
  onSubmit: () => {},
  setSubmitted: () => {},
  onClickForEdit: () => {},
  applicableMediaAreas: () => [],
  mediaAreasWithErrors: () => [],
});
