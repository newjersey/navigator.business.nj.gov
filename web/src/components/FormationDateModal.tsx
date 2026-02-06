import { Content } from "@/components/Content";
import { DateOfFormation } from "@/components/data-fields/DateOfFormation";
import { MunicipalityField } from "@/components/data-fields/MunicipalityField";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import { nexusLocationInNewJersey } from "@businessnjgovnavigator/shared/domain-logic/nexusLocationInNewJersey";
import { ReactElement, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSave: ({ redirectOnSuccess }: { redirectOnSuccess: boolean }) => void;
}

export const FormationDateModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business, updateQueue } = useUserData();

  // React 19: State initializes from business.profileData on mount
  // Component remounts via key prop (managed by parent) when modal opens
  const [profileData, setProfileData] = useState<ProfileData>(
    business?.profileData ?? createEmptyProfileData(),
  );

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  const shouldShowMunicipalityQuestion = (): boolean => {
    if (!business) {
      return false;
    }
    if (nexusLocationInNewJersey(profileData) === false) {
      return false;
    }
    return business.profileData.municipality === undefined;
  };

  FormFuncWrapper(() => {
    if (!business || !updateQueue || !isValid()) {
      return;
    }
    analytics.event.formation_date_modal.submit.formation_status_set_to_complete();
    updateQueue.queueProfileData(profileData);

    props.onSave({ redirectOnSuccess: true });
  });

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: profileData,
            flow: "STARTING",
          },
          setProfileData,
          onBack: (): void => {},
        }}
      >
        <ModalTwoButton
          isOpen={props.isOpen}
          close={props.close}
          title={Config.formationDateModal.header}
          primaryButtonText={Config.formationDateModal.saveButtonText}
          primaryButtonOnClick={onSubmit}
          secondaryButtonText={Config.formationDateModal.cancelButtonText}
        >
          <div className="margin-y-3">
            <Content>{Config.formationDateModal.description}</Content>
          </div>
          <hr className="margin-y-4" />
          <WithErrorBar
            hasError={formContextState.fieldStates.dateOfFormation.invalid}
            type="ALWAYS"
          >
            <FieldLabelModal
              fieldName="dateOfFormation"
              overrides={{
                header: Config.formationDateModal.fieldLabel,
                description: Config.formationDateModal.fieldDescription,
                headerNotBolded: "",
                postDescription: "",
              }}
            />

            <DateOfFormation
              required={true}
              disabled={false}
              futureAllowed={true}
              errorTextOverride={Config.formationDateModal.dateOfFormationErrorText}
              inputWidth="full"
            />
          </WithErrorBar>

          {shouldShowMunicipalityQuestion() && (
            <WithErrorBar
              hasError={formContextState.fieldStates.municipality.invalid}
              type="ALWAYS"
              className="margin-top-3"
            >
              <FieldLabelModal fieldName="municipality" />
              <MunicipalityField required />
            </WithErrorBar>
          )}
        </ModalTwoButton>
      </ProfileDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
