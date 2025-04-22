import { Content } from "@/components/Content";
import { FieldLabelDescriptionOnly } from "@/components/field-labels/FieldLabelDescriptionOnly";
import { TaxAccessBody } from "@/components/filings-calendar/tax-access/TaxAccessBody";
import { LegalStructureDropDown } from "@/components/LegalStructureDropDown";
import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import {
  DataFormErrorMapContext,
  DataFormErrorMapFields,
} from "@/contexts/dataFormErrorMapContext";
import { createReducedFieldStates } from "@/contexts/formContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  createEmptyProfileData,
  ProfileData,
} from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useState } from "react";

interface Props {
  moveToNextStep: () => void;
}

export const TaxAccessStepOne = (props: Props): ReactElement => {
  const fields: DataFormErrorMapFields[] = ["legalStructureId"];
  const [profileData, setProfileData] = useState<ProfileData>(
    createEmptyProfileData()
  );
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

  return (
    <div className="width-full">
      {!isValid() && (
        <Alert variant="error">{Config.taxAccess.stepOneErrorBanner}</Alert>
      )}

      <TaxAccessBody isStepOne={true} showHeader={true} />

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
            <div className="margin-bottom-2">
              <FieldLabelDescriptionOnly
                fieldName="legalStructureId"
                bold={true}
              />
              <Content>{Config.taxAccess.legalStructureDropDownHeader}</Content>
            </div>
            <LegalStructureDropDown />
          </WithErrorBar>
        </ProfileDataContext.Provider>
      </DataFormErrorMapContext.Provider>

      <div className="padding-y-3 flex flex-column flex-align-end">
        <PrimaryButton
          isColor="primary"
          isRightMarginRemoved={true}
          onClick={onSubmit}
          dataTestId="tax-calendar-access-next-button"
        >
          {Config.taxAccess.stepOneNextButton}
        </PrimaryButton>
      </div>
    </div>
  );
};
