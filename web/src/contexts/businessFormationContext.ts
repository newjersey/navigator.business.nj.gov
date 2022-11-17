import {
  createEmptyFormationDisplayContent,
  FormationDisplayContent,
  NameAvailability,
} from "@/lib/types/types";
import {
  createEmptyFormationFormData,
  FormationFields,
  FormationFormData,
  FormationLegalType,
} from "@businessnjgovnavigator/shared/";
import { createContext } from "react";

interface BusinessFormationState {
  stepIndex: number;
  formationFormData: FormationFormData;
  legalStructureId: FormationLegalType;
  displayContent: FormationDisplayContent;
  showResponseAlert: boolean;
  hasBeenSubmitted: boolean;
  interactedFields: FormationFields[];
  businessNameAvailability: NameAvailability | undefined;
  hasBusinessNameBeenSearched: boolean;
}

interface BusinessFormationContextType {
  state: BusinessFormationState;
  setFormationFormData: React.Dispatch<React.SetStateAction<FormationFormData>>;
  setStepIndex: (value: number) => void;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setFieldInteracted: (field: FormationFields, config?: { setToUninteracted: boolean }) => void;
  setHasBeenSubmitted: (hasBeenSubmitted: boolean) => void;
  setBusinessNameAvailability: (nameAvailability: NameAvailability | undefined) => void;
}

export const BusinessFormationContext = createContext<BusinessFormationContextType>({
  state: {
    stepIndex: 0,
    legalStructureId: "limited-liability-company",
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent()["limited-liability-company"],
    showResponseAlert: false,
    hasBeenSubmitted: false,
    interactedFields: [],
    businessNameAvailability: undefined,
    hasBusinessNameBeenSearched: false,
  },
  setFormationFormData: () => {},
  setStepIndex: () => {},
  setShowResponseAlert: () => {},
  setFieldInteracted: () => {},
  setHasBeenSubmitted: () => {},
  setBusinessNameAvailability: () => {},
});
