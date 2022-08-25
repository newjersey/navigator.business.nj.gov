import {
  createEmptyFormationDisplayContent,
  FormationDisplayContent,
  FormationFieldErrorMap,
} from "@/lib/types/types";
import {
  createEmptyFormationFormData,
  FormationFields,
  FormationFormData,
  FormationLegalType,
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { createContext } from "react";

const allFormationFormFields = Object.keys(createEmptyFormationFormData()) as (keyof FormationFormData)[];

const createFormationFieldErrorMap = (): FormationFieldErrorMap =>
  allFormationFormFields.reduce((acc, field: FormationFields) => {
    acc[field] = { name: field, invalid: false };
    return acc;
  }, {} as FormationFieldErrorMap);

interface BusinessFormationState {
  tab: number;
  formationFormData: FormationFormData;
  legalStructureId: FormationLegalType;
  displayContent: FormationDisplayContent;
  municipalities: Municipality[];
  showErrors: boolean;
  errorMap: FormationFieldErrorMap;
  showResponseAlert: boolean;
}

interface BusinessFormationContextType {
  state: BusinessFormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
  fieldsAreInvalid: (fields: FormationFields[]) => boolean;
  setErrorMap: (errorMap: FormationFieldErrorMap) => void;
  setTab: (value: number) => void;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setShowErrors: React.Dispatch<React.SetStateAction<boolean>>;
}

export const BusinessFormationContext = createContext<BusinessFormationContextType>({
  state: {
    tab: 0,
    legalStructureId: "limited-liability-company",
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent()["limited-liability-company"],
    municipalities: [],
    showErrors: false,
    errorMap: createFormationFieldErrorMap(),
    showResponseAlert: false,
  },
  setFormationFormData: () => {},
  fieldsAreInvalid: () => {
    return false;
  },
  setErrorMap: () => {},
  setShowErrors: () => {},
  setTab: () => {},
  setShowResponseAlert: () => {},
});
