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
  Municipality,
} from "@businessnjgovnavigator/shared/";
import { createContext } from "react";

interface BusinessFormationState {
  tab: number;
  formationFormData: FormationFormData;
  legalStructureId: FormationLegalType;
  displayContent: FormationDisplayContent;
  municipalities: Municipality[];
  showResponseAlert: boolean;
  hasBeenSubmitted: boolean;
  interactedFields: FormationFields[];
  businessNameAvailability: NameAvailability | undefined;
  hasBusinessNameBeenSearched: boolean;
}

interface BusinessFormationContextType {
  state: BusinessFormationState;
  setFormationFormData: (formationFormData: FormationFormData) => void;
  setTab: (value: number) => void;
  setShowResponseAlert: React.Dispatch<React.SetStateAction<boolean>>;
  setFieldInteracted: (field: FormationFields, config?: { setToUninteracted: boolean }) => void;
  setHasBeenSubmitted: (hasBeenSubmitted: boolean) => void;
  setBusinessNameAvailability: (nameAvailability: NameAvailability | undefined) => void;
}

export const BusinessFormationContext = createContext<BusinessFormationContextType>({
  state: {
    tab: 0,
    legalStructureId: "limited-liability-company",
    formationFormData: createEmptyFormationFormData(),
    displayContent: createEmptyFormationDisplayContent()["limited-liability-company"],
    municipalities: [],
    showResponseAlert: false,
    hasBeenSubmitted: false,
    interactedFields: [],
    businessNameAvailability: undefined,
    hasBusinessNameBeenSearched: false,
  },
  setFormationFormData: () => {},
  setTab: () => {},
  setShowResponseAlert: () => {},
  setFieldInteracted: () => {},
  setHasBeenSubmitted: () => {},
  setBusinessNameAvailability: () => {},
});
