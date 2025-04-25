import { Heading } from "@/components/njwds-extended/Heading";
import { TaxClearanceSteps } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps";
import { AddressContext } from "@/contexts/addressContext";
import { getMergedConfig } from "@/contexts/configContext";
import { createDataFormErrorMap, DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import { getFlow, scrollToTop, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  emptyTaxClearanceCertificateData,
  LookupMunicipalityByName,
  TaxClearanceCertificateData,
} from "@businessnjgovnavigator/shared";
import { emptyFormationAddressData, FormationAddress } from "@businessnjgovnavigator/shared/formationData";
import { createEmptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { ReactElement, useState } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
  CMS_ONLY_certificatePdfBlob?: Blob;
}

const Config = getMergedConfig();

const allFieldsNonEmpty = (taxClearanceCertificateData: TaxClearanceCertificateData): boolean => {
  return (
    (taxClearanceCertificateData.requestingAgencyId ?? "").trim() !== "" &&
    (taxClearanceCertificateData.businessName ?? "").trim() !== "" &&
    (taxClearanceCertificateData.addressLine1 ?? "").trim() !== "" &&
    (taxClearanceCertificateData.addressCity ?? "").trim() !== "" &&
    taxClearanceCertificateData.addressState !== undefined &&
    (taxClearanceCertificateData.addressZipCode ?? "").trim() !== "" &&
    (taxClearanceCertificateData.taxId ?? "").trim() !== "" &&
    (taxClearanceCertificateData.taxPin ?? "").trim() !== ""
  );
};

export const AnytimeActionTaxClearanceCertificateElement = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const [taxClearanceCertificateData, setTaxClearanceCertificateData] = useState(
    emptyTaxClearanceCertificateData
  );
  const [formationAddressData, setAddressData] = useState<FormationAddress>(emptyFormationAddressData);
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

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

  const {
    FormFuncWrapper,
    isValid,
    getInvalidFieldIds,
    onSubmit,
    state: formContextState,
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

  const taxClearanceCertificateSteps = [
    {
      name: Config.taxClearanceCertificateShared.stepperOneLabel,
      hasError: false,
      isComplete: stepIndex > 0,
    },
    {
      name: Config.taxClearanceCertificateShared.stepperTwoLabel,
      hasError: false,
      isComplete: isValid() && allFieldsNonEmpty(taxClearanceCertificateData),
    },
    { name: Config.taxClearanceCertificateShared.stepperThreeLabel, hasError: false, isComplete: false },
  ];

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
            <div className="min-height-38rem">
              <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
                <div className="padding-y-4 margin-x-4 margin-bottom-2">
                  <Heading level={1}>{props.anytimeAction.name}</Heading>
                </div>
              </div>
              <TaxClearanceSteps
                steps={taxClearanceCertificateSteps}
                certificatePdfBlob={props.CMS_ONLY_certificatePdfBlob}
                currentStep={stepIndex}
                stepIndex={setStepIndex}
                saveTaxClearanceCertificateData={saveTaxClearanceCertificateData}
                setStepIndex={setStepIndex}
                isValid={isValid}
                getInvalidFieldIds={getInvalidFieldIds}
                onSubmit={onSubmit}
              />
            </div>
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </TaxClearanceCertificateDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
