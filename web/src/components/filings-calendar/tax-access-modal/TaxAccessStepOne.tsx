import { Content } from "@/components/Content";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { LegalStructureDropDown } from "@/components/LegalStructureDropDown";
import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext, DataFormErrorMapFields } from "@/contexts/dataFormErrorMapContext";
import { createReducedFieldStates } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useState } from "react";

interface Props {
  // isOpen: boolean;
  // close: () => void;
  moveToNextStep: () => void;
}

export const TaxAccessStepOne = (props: Props): ReactElement => {
  const fields: DataFormErrorMapFields[] = ["legalStructureId"];
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());
  const { business, updateQueue } = useUserData();
  const { Config } = useConfig();

  useMountEffectWhenDefined(() => {
    if (!business) return;
    setProfileData(business.profileData);
  }, business);

  const {
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
    isValid,
  } = useFormContextHelper(createReducedFieldStates(fields));

  FormFuncWrapper(async () => {
    if (!updateQueue) return;
    await updateQueue.queueProfileData(profileData).update();
    props.moveToNextStep();
  });

  // const onClose = (): void => {
  //   props.close();
  //   if (!business) return;
  //   setProfileData(business.profileData);
  //   formContextState.reducer({ type: FieldStateActionKind.RESET });
  // };

  return (
    // used to be <ModalOneButton
    <div
    // isOpen={props.isOpen}
    // close={onClose}
    // title={Config.taxAccess.modalHeader}
    // primaryButtonText={Config.taxAccess.stepOneNextButton}
    // primaryButtonOnClick={onSubmit}
    >
      <Heading level={0} styleVariant="h2" className="padding-x-1 margin-0-override">
        <Icon iconName="check" /> {Config.taxAccess.modalHeader}
      </Heading>
      {!isValid() && <Alert variant="error">{Config.taxAccess.stepOneErrorBanner}</Alert>}

      {/* literally just the text for step 1 of 2, and the info text */}
      {/* <TaxAccessModalBody isStepOne={true} showHeader={true} /> */}
      <div className="margin-y-3">
        <Heading level={2} styleVariant="h4">
          {Config.taxAccess.stepOneHeader}
        </Heading>
        <Content>{Config.taxAccess.stepOneBody}</Content>
      </div>

      <DataFormErrorMapContext.Provider value={formContextState}>
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: "OWNING",
            },
            setProfileData,
            onBack: (): void => {},
          }}
        >
          <WithErrorBar hasError={!isValid()} type="ALWAYS">
            <FieldLabelDescriptionOnly fieldName="legalStructureId" bold={true} />
            <Content>{Config.taxAccess.legalStructureDropDownHeader}</Content>
            {/* this is the dropdown form feidl */}
            <LegalStructureDropDown />
          </WithErrorBar>
        </ProfileDataContext.Provider>
      </DataFormErrorMapContext.Provider>
    </div>
  );
};
