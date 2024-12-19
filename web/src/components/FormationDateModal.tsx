import { Content } from "@/components/Content";
import { DateOfFormation } from "@/components/data-fields/DateOfFormation";
import { MunicipalityField } from "@/components/data-fields/MunicipalityField";
import { FieldLabelModal } from "@/components/field-labels/FieldLabelModal";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { ProfileFormContext } from "@/contexts/profileFormContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { createProfileFieldErrorMap } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared";
import { nexusLocationInNewJersey } from "@businessnjgovnavigator/shared/domain-logic/nexusLocationInNewJersey";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSave: ({ redirectOnSuccess }: { redirectOnSuccess: boolean }) => void;
}

export const FormationDateModal = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const { business, updateQueue } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

  const {
    FormFuncWrapper,
    onSubmit,
    isValid,
    state: formContextState,
  } = useFormContextHelper(createProfileFieldErrorMap());

  useEffect(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, [business]);

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
    <ProfileFormContext.Provider value={formContextState}>
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
          <WithErrorBar hasError={formContextState.fieldStates.dateOfFormation.invalid} type="ALWAYS">
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
    </ProfileFormContext.Provider>
  );
};
