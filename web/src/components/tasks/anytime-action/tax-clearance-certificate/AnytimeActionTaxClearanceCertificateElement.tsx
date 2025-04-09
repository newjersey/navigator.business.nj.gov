import { Heading } from "@/components/njwds-extended/Heading";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { AnytimeActionTaxClearanceCertificateElementAlert } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateElementAlert";
import { TaxClearanceStepOne } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepOne";
import { TaxClearanceStepThree } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepThree";
import { TaxClearanceStepTwo } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepTwo";
import { AddressContext } from "@/contexts/addressContext";
import { getMergedConfig } from "@/contexts/configContext";
import { createDataFormErrorMap, DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask, StepperStep } from "@/lib/types/types";
import { getFlow, scrollToTop, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  emptyTaxClearanceCertificateData,
  LookupMunicipalityByName,
  TaxClearanceCertificateData,
} from "@businessnjgovnavigator/shared";
import { emptyFormationAddressData, FormationAddress } from "@businessnjgovnavigator/shared/formationData";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { isEqual } from "lodash";
import { ReactElement, useEffect, useState } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
}

const Config = getMergedConfig();

const initialTaxClearanceCertificateSteps: StepperStep[] = [
  { name: Config.taxClearanceCertificateShared.stepperOneLabel, hasError: false, isComplete: false },
  { name: Config.taxClearanceCertificateShared.stepperTwoLabel, hasError: false, isComplete: false },
  { name: Config.taxClearanceCertificateShared.stepperThreeLabel, hasError: false, isComplete: false },
];

const allFieldsNonEmpty = (certificateData: TaxClearanceCertificateData): boolean => {
  return (
    certificateData.requestingAgencyId.trim() !== "" &&
    certificateData.businessName.trim() !== "" &&
    certificateData.addressLine1.trim() !== "" &&
    certificateData.addressCity.trim() !== "" &&
    certificateData.addressState !== undefined &&
    certificateData.addressZipCode.trim() !== "" &&
    certificateData.taxId.trim() !== "" &&
    certificateData.taxPin.trim() !== ""
  );
};

export const AnytimeActionTaxClearanceCertificateElement = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const [stateTaxClearanceCertificateSteps, setStateTaxClearanceCertificateSteps] = useState(
    initialTaxClearanceCertificateSteps
  );
  const [taxClearanceCertificateData, setTaxClearanceCertificateData] = useState(
    emptyTaxClearanceCertificateData
  );
  const [formationAddressData, setAddressData] = useState<FormationAddress>(emptyFormationAddressData);
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

  const updateStepTwoComplete = (): void => {};

  const saveTaxClearanceCertificateData = (): void => {
    const newTaxClearanceCertificateData = {
      requestingAgencyId: taxClearanceCertificateData.requestingAgencyId,
      businessName: profileData.businessName,
      addressLine1: formationAddressData.addressLine1,
      addressLine2: formationAddressData.addressLine2,
      addressCity: formationAddressData.addressCity || "",
      addressState: formationAddressData.addressState,
      addressZipCode: formationAddressData.addressZipCode,
      taxId: profileData.taxId || "",
      taxPin: profileData.taxPin || "",
    };

    updateQueue
      ?.queueBusiness({
        ...updateQueue.currentBusiness(),
        taxClearanceCertificateData: newTaxClearanceCertificateData,
      })
      .update();
  };

  useMountEffectWhenDefined(() => {
    if (business) {
      const newRequestingAgencyId = business.taxClearanceCertificateData?.requestingAgencyId || "";
      const newBusinessName =
        business?.taxClearanceCertificateData?.businessName || business?.profileData.businessName || "";
      const newAddressLine1 =
        business?.taxClearanceCertificateData?.addressLine1 ||
        business.formationData.formationFormData.addressLine1 ||
        "";
      const newAddressLine2 =
        business?.taxClearanceCertificateData?.addressLine2 ||
        business.formationData.formationFormData.addressLine2 ||
        "";
      const newAddressCity =
        business?.taxClearanceCertificateData?.addressCity ||
        LookupMunicipalityByName(business?.formationData?.formationFormData?.addressMunicipality?.name)
          ?.displayName ||
        business.formationData.formationFormData.addressCity ||
        "";
      const newAddressState =
        business?.taxClearanceCertificateData?.addressState ||
        business.formationData?.formationFormData?.addressState ||
        undefined;
      const newAddressZipCode =
        business?.taxClearanceCertificateData?.addressZipCode ||
        business.formationData.formationFormData.addressZipCode ||
        "";
      const newTaxId = business?.taxClearanceCertificateData?.taxId || business.profileData.taxId || "";
      const newTaxPin = business?.taxClearanceCertificateData?.taxPin || business.profileData.taxPin || "";

      setTaxClearanceCertificateData({
        ...taxClearanceCertificateData,
        requestingAgencyId: newRequestingAgencyId,
        businessName: newBusinessName,
        taxId: newTaxId,
        taxPin: newTaxPin,
        addressLine1: newAddressLine1,
        addressLine2: newAddressLine2,
        addressCity: newAddressCity,
        addressState: newAddressState,
        addressZipCode: newAddressZipCode,
      });

      setProfileData({
        ...profileData,
        businessName: newBusinessName,
        taxId: newTaxId,
        taxPin: newTaxPin,
      });

      setAddressData({
        ...formationAddressData,
        businessLocationType: business?.formationData.formationFormData.businessLocationType,
        addressLine1: newAddressLine1,
        addressLine2: newAddressLine2,
        addressCity: newAddressCity,
        addressState: newAddressState,
        addressZipCode: newAddressZipCode,
      });
    }
  }, business);

  // TODO: intentionally left since we are picking up next error handling functionality
  // const { errorMap: taxClearanceFieldErrorMap, FormContext: TaxClearanceCertificateFormContext } =
  //   useDynamicFormContext(taxClearanceCertificateFields);
  const {
    FormFuncWrapper,
    isValid,
    state: formContextState,
    getInvalidFieldIds,
    onSubmit,
  } = useFormContextHelper(createDataFormErrorMap());

  FormFuncWrapper(
    async (): Promise<void> => {
      if (!business || !isValid()) {
        scrollToTop();
        return;
      }
      scrollToTop();
    },
    () => {}
  );

  const saveButton = (): void => {
    saveTaxClearanceCertificateData();
    updateStepTwoComplete();
    if (isValid() && allFieldsNonEmpty(taxClearanceCertificateData)) {
      setStepIndex(2);
    } else {
      const steps = stateTaxClearanceCertificateSteps.map((step) => ({ ...step }));
      steps[1].isComplete = false;
      setStateTaxClearanceCertificateSteps(steps);
    }
  };

  useEffect(() => {
    const updateStepOne = (steps: StepperStep[]): void => {
      if (stepIndex === 0) {
        steps[0].isComplete = false;
      } else {
        steps[0].isComplete = true;
      }
    };

    const updateStepTwo = (steps: StepperStep[]): void => {
      console.log(
        "isvalid",
        isValid(),
        "all fields non empty",
        allFieldsNonEmpty(taxClearanceCertificateData)
      );
      if (isValid() && allFieldsNonEmpty(taxClearanceCertificateData)) {
        steps[1].isComplete = true;
      } else {
        steps[1].isComplete = false;
      }
    };

    const steps = stateTaxClearanceCertificateSteps.map((step) => ({ ...step }));
    updateStepOne(steps);
    updateStepTwo(steps);

    if (!isEqual(steps, stateTaxClearanceCertificateSteps)) {
      setStateTaxClearanceCertificateSteps(steps);
    }
  }, [stepIndex, stateTaxClearanceCertificateSteps, taxClearanceCertificateData, isValid]);

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <TaxClearanceCertificateDataContext.Provider
        value={{
          state: taxClearanceCertificateData,
          setTaxClearanceCertificateData,
        }}
      >
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData),
            },
            setProfileData,
            onBack: (): void => {},
          }}
        >
          <AddressContext.Provider
            value={{
              state: { formationAddressData },
              setAddressData,
            }}
          >
            <div className="min-height-38rem" data-testid="AnytimeActionTaxClearanceCertificateElement">
              <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
                <div className="padding-y-4 margin-x-4 margin-bottom-2">
                  <Heading level={1}>{props.anytimeAction.name}</Heading>
                </div>
              </div>
              <HorizontalStepper
                steps={stateTaxClearanceCertificateSteps}
                currentStep={stepIndex}
                onStepClicked={(step: number): void => {
                  if (!isValid() || !allFieldsNonEmpty(taxClearanceCertificateData)) {
                    const steps = stateTaxClearanceCertificateSteps.map((step) => ({ ...step }));
                    steps[1].isComplete = false;
                    setStateTaxClearanceCertificateSteps(steps);
                  }
                  if (step === 2 && stepIndex === 1) {
                    saveTaxClearanceCertificateData();
                  }
                  setStepIndex(step);
                }}
              />
              {stepIndex === 0 && <TaxClearanceStepOne setStepIndex={setStepIndex} />}
              {stepIndex === 1 && (
                <>
                  <AnytimeActionTaxClearanceCertificateElementAlert fieldErrors={getInvalidFieldIds()} />
                  <TaxClearanceStepTwo
                    updateStepTwoComplete={updateStepTwoComplete}
                    setStepIndex={setStepIndex}
                    saveTaxClearanceCertificateData={saveTaxClearanceCertificateData}
                    onSave={saveButton}
                    onSubmit={onSubmit}
                  />
                </>
              )}
              {stepIndex === 2 && (
                <>
                  <AnytimeActionTaxClearanceCertificateElementAlert fieldErrors={getInvalidFieldIds()} />
                  <TaxClearanceStepThree setStepIndex={setStepIndex} />
                </>
              )}
            </div>
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </TaxClearanceCertificateDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
