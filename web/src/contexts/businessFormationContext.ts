import {
  createEmptyFormationDisplayContent,
  FormationDisplayContent,
  FormationFieldErrorMap,
  FormationFields,
} from "@/lib/types/types";
import {
  createEmptyFormationFormData,
  FormationFormData,
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { createContext } from "react";

const allFormationFormFields = Object.keys(createEmptyFormationFormData()) as (keyof FormationFormData)[];

const createFormationFieldErrorMap = (): FormationFieldErrorMap =>
  allFormationFormFields.reduce((acc, field: FormationFields) => {
    acc[field] = { invalid: false };
    return acc;
  }, {} as FormationFieldErrorMap);

interface BusinessFormationState {
  tab: number;
  formationFormData: FormationFormData;
  displayContent: FormationDisplayContent;
  municipalities: Municipality[];
  errorMap: FormationFieldErrorMap;
  showResponseAlert: boolean;
}

interface BusinessFormationContextType {
  state: BusinessFormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
  setErrorMap: (errorMap: FormationFieldErrorMap) => void;
  setTab: React.Dispatch<React.SetStateAction<number>>;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BusinessFormationContext = createContext<BusinessFormationContextType>({
  state: {
    tab: 0,
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent(),
    municipalities: [],
    errorMap: createFormationFieldErrorMap(),
    showResponseAlert: false,
  },
  setFormationFormData: () => {},
  setErrorMap: () => {},
  setTab: () => {},
  setShowResponseAlert: () => {},
});
