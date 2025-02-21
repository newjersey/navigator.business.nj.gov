import { Heading } from "@/components/njwds-extended/Heading";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaxClearanceStepOne } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepOne";
import { TaxClearanceStepThree } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepThree";
import { TaxClearanceStepTwo } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceStepTwo";
import { AddressContext } from "@/contexts/addressContext";
import { createDataFieldErrorMap, DataFieldFormContext } from "@/contexts/dataFieldFormContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask, StepperStep } from "@/lib/types/types";
import { emptyFormationAddressData, FormationAddress } from "@businessnjgovnavigator/shared/formationData";
import { ReactElement, useEffect, useState } from "react";
import {ProfileDataContext} from "@/contexts/profileDataContext";
import {createEmptyProfileData, ProfileData} from "@businessnjgovnavigator/shared/profileData";
import {getFlow, useMountEffectWhenDefined} from "@/lib/utils/helpers";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
}

const initialTaxClearanceCertificateSteps = (): StepperStep[] => [
  { name: "Requirements", hasError: false, isComplete: false },
  { name: "Check Eligibility", hasError: false, isComplete: false },
  { name: "Review", hasError: false, isComplete: false },
];

export const AnytimeActionTaxClearanceCertificateElement = (props: Props): ReactElement => {
  const { business } = useUserData();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const [stateTaxClearanceCertificateSteps, setStateTaxClearanceCertificateSteps] = useState(
    initialTaxClearanceCertificateSteps()
  );
  const [formationAddressData, setAddressData] = useState<FormationAddress>({
    ...emptyFormationAddressData,
    businessLocationType: business?.formationData.formationFormData.businessLocationType==="NJ"?"NJ":"US",
  });

  const initialTaxClearanceCertificateData = {
    requestingAgencyId: business?.taxClearanceCertificateData?.requestingAgencyId || "",
    // businessName: business?.taxClearanceCertificateData?.businessName || "",
    // entityId: "",
    // addressLine1: "",
    // addressLine2: "",
    // addressCity: "",
    // addressState: "",
    // addressZipCode: "",
    // taxId: "",
    // taxPin: "",
  };
  const [taxClearanceCertificateData, setTaxClearanceCertificateData] = useState(
    initialTaxClearanceCertificateData
  );

  // const { errorMap: taxClearanceFieldErrorMap, FormContext: TaxClearanceCertificateFormContext } =
  //   useDynamicFormContext(taxClearanceCertificateFields);
  // const { state: formContextState } = useFormContextHelper(taxClearanceFieldErrorMap);

  // const {
  //   // FormFuncWrapper,
  //   // onSubmit,
  //   // tab: profileTab,
  //   // onTabChange: setProfileTab,
  //   state: formContextState,
  //   // getInvalidFieldIds,

  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());


  const { state: formContextState } = useFormContextHelper(createDataFieldErrorMap());

  const updateSteps = (step: number): void => {
    const steps = initialTaxClearanceCertificateSteps();
    step === 0 ? (steps[0].isComplete = false) : (steps[0].isComplete = true);
    setStateTaxClearanceCertificateSteps(steps);
  };

  useEffect(() => {
    updateSteps(stepIndex);
  }, [stepIndex]);

  useMountEffectWhenDefined(() => {
    if(business?.formationData.formationFormData.businessLocationType==="US"||business?.formationData.formationFormData.businessLocationType==="NJ") {
      if (business?.profileData) {
        setProfileData(business.profileData);
      }

      if (business?.formationData.formationFormData.addressLine1) {
        console.log(JSON.stringify(business.formationData.formationFormData));
        const addressCity = business.formationData.formationFormData.addressState?.shortCode === "NJ" ? business.formationData.formationFormData.addressMunicipality?.displayName : business.formationData.formationFormData.addressCity;

        setAddressData({
          addressLine1: business.formationData.formationFormData.addressLine1,
          addressLine2: business.formationData.formationFormData.addressLine2,
          addressCity: addressCity,
          addressMunicipality: business.formationData.formationFormData.addressMunicipality,
          addressState: business.formationData.formationFormData.addressState,
          addressZipCode: business.formationData.formationFormData.addressZipCode,
          addressCountry: business.formationData.formationFormData.addressCountry,
          addressProvince: business.formationData.formationFormData.addressProvince,
          businessLocationType: business.formationData.formationFormData.businessLocationType,
        });
      }
    }

  }, business);

  return (
    // {/* Used for Error State / Form Context Helper*/}
    <DataFieldFormContext.Provider value={formContextState}>
      {/* Used for address context*/}
      <AddressContext.Provider
        value={{
          state: { formationAddressData },
          setAddressData,
        }}
      >
        {/* Used for tax clearance context - only for new drowdown value*/}
        <TaxClearanceCertificateDataContext.Provider
          value={{
            state: taxClearanceCertificateData,
            setTaxClearanceCertificateData,
          }}
        >
          {/* Add Profile Data Context to other fields*/}
          <ProfileDataContext.Provider value={{
            state: {
              profileData: profileData,
              flow: getFlow(profileData),
            },
            setProfileData,
            onBack: (): void => {},
          }}>

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
                setStepIndex(step);
              }}
            />
            {stepIndex === 0 && <TaxClearanceStepOne setStepIndex={setStepIndex} />}
            {stepIndex === 1 && <TaxClearanceStepTwo />}
            {stepIndex === 2 && <TaxClearanceStepThree />}
          </div>
          </ProfileDataContext.Provider>
        </TaxClearanceCertificateDataContext.Provider>
      </AddressContext.Provider>
    </DataFieldFormContext.Provider>
  );
};
