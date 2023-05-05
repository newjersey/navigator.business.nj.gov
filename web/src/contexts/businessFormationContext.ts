import { createEmptyDbaDisplayContent, FormationDbaContent } from "@/lib/types/types";
import {
  createEmptyFormationFormData,
  FieldsForErrorHandling,
  FormationFormData,
  InputFile,
  NameAvailability,
} from "@businessnjgovnavigator/shared";
import { createContext } from "react";

interface BusinessFormationState {
  stepIndex: number;
  formationFormData: FormationFormData;
  businessNameAvailability: NameAvailability | undefined;
  dbaBusinessNameAvailability: NameAvailability | undefined;
  showResponseAlert: boolean;
  hasBeenSubmitted: boolean;
  dbaContent: FormationDbaContent;
  interactedFields: FieldsForErrorHandling[];
  hasSetStateFirstTime: boolean;
  foreignGoodStandingFile: InputFile | undefined;
}

interface BusinessFormationContextType {
  state: BusinessFormationState;
  setFormationFormData: React.Dispatch<React.SetStateAction<FormationFormData>>;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setFieldsInteracted: (fields: FieldsForErrorHandling[], config?: { setToUninteracted: boolean }) => void;
  setHasBeenSubmitted: (hasBeenSubmitted: boolean) => void;
  setBusinessNameAvailability: React.Dispatch<React.SetStateAction<NameAvailability | undefined>>;
  setDbaBusinessNameAvailability: React.Dispatch<React.SetStateAction<NameAvailability | undefined>>;
  setForeignGoodStandingFile: (file: InputFile | undefined) => void;
}

export const BusinessFormationContext = createContext<BusinessFormationContextType>({
  state: {
    stepIndex: 0,
    formationFormData: { ...createEmptyFormationFormData(), legalType: "limited-liability-company" },
    dbaContent: createEmptyDbaDisplayContent(),
    showResponseAlert: false,
    hasBeenSubmitted: false,
    interactedFields: [],
    foreignGoodStandingFile: undefined,
    hasSetStateFirstTime: false,
    businessNameAvailability: undefined,
    dbaBusinessNameAvailability: undefined,
  },
  setFormationFormData: () => {},
  setStepIndex: () => {},
  setShowResponseAlert: () => {},
  setFieldsInteracted: () => {},
  setHasBeenSubmitted: () => {},
  setBusinessNameAvailability: () => {},
  setDbaBusinessNameAvailability: () => {},
  setForeignGoodStandingFile: () => {},
});
