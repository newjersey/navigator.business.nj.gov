import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import {
  createEmptyDbaDisplayContent,
  createFormationFieldErrorMap,
  createProfileFieldErrorMap
} from "@/lib/types/types";
import { getFlow } from "@/lib/utils/helpers";
import { statefulDataHelpers } from "@/test/mock/withStatefulData";
import { ProfileData } from "@businessnjgovnavigator/shared/";
import { ReactElement, ReactNode, useEffect, useState } from "react";
import {createEmptyFormationFormData, FormationFormData, InputFile} from "@businessnjgovnavigator/shared/formationData";
import { FormationFormContext } from "@/contexts/formationFormContext";
import { BusinessFormationContext } from "@/contexts/businessFormationContext";

const updateSpy = jest.fn();

export const helpers = statefulDataHelpers(updateSpy);

export const getLastCalledWithConfig = helpers.getLastCalledWithConfig;

export const currentFormationFormData = helpers.currentData as () => FormationFormData;

export const formationFormDataWasNotUpdated = helpers.dataWasNotUpdated;

export const formationFormDataUpdatedNTimes = helpers.dataUpdatedNTimes;

export const WithStatefulFormationFormDataContext = ({ children }: { children: ReactNode }): ReactElement => {
  const { state: formContextState } = useFormContextHelper(createFormationFieldErrorMap());
  return <FormationFormContext.Provider value={formContextState}>{children}</FormationFormContext.Provider>;
};

export const WithStatefulFormationFormData = ({
  children,
  initialData,
  initialForeignGoodStandingFile
}: {
  children: ReactNode;
  initialData: FormationFormData;
  initialForeignGoodStandingFile?: InputFile | undefined
}): ReactElement => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [genericData, setGenericData] = useState<FormationFormData>(initialData);
  const [foreignGoodStandingFile, setForeignGoodStandingFile] = useState<InputFile | undefined>(initialForeignGoodStandingFile);

  useEffect(() => {
    updateSpy(genericData);
  }, [genericData]);

  return (
    <WithStatefulFormationFormDataContext>
      <BusinessFormationContext.Provider
        value={{
          state: {
            stepIndex: -1,
            formationFormData: genericData,
            dbaContent: createEmptyDbaDisplayContent(),
            showResponseAlert: false,
            hasBeenSubmitted: false,
            interactedFields: [],
            foreignGoodStandingFile: foreignGoodStandingFile,
            hasSetStateFirstTime: false,
            businessNameAvailability: undefined,
            dbaBusinessNameAvailability: undefined,
          },
          setFormationFormData: setGenericData,
          setStepIndex: () => {},
          setShowResponseAlert: () => {},
          setFieldsInteracted: () => {},
          setHasBeenSubmitted: () => {},
          setBusinessNameAvailability: () => {},
          setDbaBusinessNameAvailability: () => {},
          setForeignGoodStandingFile: setForeignGoodStandingFile,
        }}
      >
        {children}
      </BusinessFormationContext.Provider>{" "}
    </WithStatefulFormationFormDataContext>
  );
};
