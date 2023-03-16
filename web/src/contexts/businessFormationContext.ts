import { createEmptyDbaDisplayContent, FormationDbaContent } from "@/lib/types/types";
import {
  createEmptyFormationFormData,
  FormationFields,
  FormationFormData,
} from "@businessnjgovnavigator/shared/";
import { createContext } from "react";

interface BusinessFormationState {
  stepIndex: number;
  formationFormData: FormationFormData;
  showResponseAlert: boolean;
  hasBeenSubmitted: boolean;
  dbaContent: FormationDbaContent;
  interactedFields: FormationFields[];
  hasSetStateFirstTime: boolean;
}

interface BusinessFormationContextType {
  state: BusinessFormationState;
  setFormationFormData: React.Dispatch<React.SetStateAction<FormationFormData>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setFieldsInteracted: (fields: FormationFields[], config?: { setToUninteracted: boolean }) => void;
  setHasBeenSubmitted: (hasBeenSubmitted: boolean) => void;
}

export const BusinessFormationContext = createContext<BusinessFormationContextType>({
  state: {
    stepIndex: 0,
    formationFormData: { ...createEmptyFormationFormData(), legalType: "limited-liability-company" },
    dbaContent: createEmptyDbaDisplayContent(),
    showResponseAlert: false,
    hasBeenSubmitted: false,
    interactedFields: [],
    hasSetStateFirstTime: false,
  },
  setFormationFormData: () => {},
  setStepIndex: () => {},
  setShowResponseAlert: () => {},
  setFieldsInteracted: () => {},
  setHasBeenSubmitted: () => {},
});
