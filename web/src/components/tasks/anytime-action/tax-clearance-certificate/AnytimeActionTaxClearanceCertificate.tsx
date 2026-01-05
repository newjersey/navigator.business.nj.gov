import { Heading } from "@/components/njwds-extended/Heading";
import { getInitialData } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { TaxClearanceSteps } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps";
import { AddressContext } from "@/contexts/addressContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getFlow, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { emptyTaxClearanceCertificateData } from "@businessnjgovnavigator/shared";
import {
  emptyFormationAddressData,
  FormationAddress,
} from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { TaxClearanceCertificateData } from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import {
  AnytimeActionLicenseReinstatement,
  AnytimeActionTask,
} from "@businessnjgovnavigator/shared/types";
import { Dispatch, ReactElement, SetStateAction, useCallback, useMemo, useState } from "react";
import { flushSync } from "react-dom";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
  CMS_ONLY_certificatePdfBlob?: Blob;
}

export const AnytimeActionTaxClearanceCertificate = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const [taxClearanceCertificateData, setTaxClearanceCertificateData] =
    useState<TaxClearanceCertificateData>(emptyTaxClearanceCertificateData);

  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);
  const [certificatePdfBlob, setCertificatePdfBlob] = useState<Blob | undefined>(
    props.CMS_ONLY_certificatePdfBlob || undefined,
  );

  // React 19 fix: Use useCallback to create stable function references
  const setAddress = useCallback<Dispatch<SetStateAction<FormationAddress>>>((action) => {
    setAddressData(action);
  }, []);

  const setProfile = useCallback<Dispatch<SetStateAction<ProfileData>>>((action) => {
    setProfileData(action);
  }, []);

  const saveTaxClearanceCertificateData = async (): Promise<void> => {
    if (!business || !updateQueue) {
      return;
    }

    // React 19 fix: Read current state values and merge them
    // Build data by merging local state contexts
    const dataToSave = {
      ...taxClearanceCertificateData,
      businessName: profileData.businessName || taxClearanceCertificateData.businessName,
      taxId: profileData.taxId || taxClearanceCertificateData.taxId,
      taxPin: profileData.taxPin || taxClearanceCertificateData.taxPin,
      // Clear encrypted fields if plaintext changed
      encryptedTaxId:
        profileData.taxId === taxClearanceCertificateData.taxId
          ? profileData.encryptedTaxId
          : undefined,
      encryptedTaxPin:
        profileData.taxPin === taxClearanceCertificateData.taxPin
          ? profileData.encryptedTaxPin
          : undefined,
      addressLine1: formationAddressData.addressLine1 || taxClearanceCertificateData.addressLine1,
      addressLine2: formationAddressData.addressLine2 || taxClearanceCertificateData.addressLine2,
      addressCity: formationAddressData.addressCity || taxClearanceCertificateData.addressCity,
      addressState: formationAddressData.addressState || taxClearanceCertificateData.addressState,
      addressZipCode:
        formationAddressData.addressZipCode || taxClearanceCertificateData.addressZipCode,
    };

    // React 19 fix: Use flushSync to force setState to complete before calling update()
    // This prevents "Cannot update component while rendering" error
    flushSync(() => {
      setTaxClearanceCertificateData(dataToSave);
    });

    // Update backend - now that local state is flushed, this is safe
    await updateQueue
      ?.queueBusiness({
        ...updateQueue.currentBusiness(),
        taxClearanceCertificateData: dataToSave,
        profileData: {
          ...updateQueue.currentBusiness().profileData,
          taxId: dataToSave.taxId,
          encryptedTaxId: dataToSave.encryptedTaxId,
        },
        lastUpdatedISO: new Date(Date.now()).toISOString(),
      })
      .update();
  };

  useMountEffectWhenDefined(() => {
    if (business) {
      const {
        requestingAgencyId,
        businessName,
        addressLine1,
        addressLine2,
        addressCity,
        addressZipCode,
        addressState,
        taxId,
        encryptedTaxId,
        taxPin,
        encryptedTaxPin,
        hasPreviouslyReceivedCertificate,
        lastUpdatedISO,
      } = getInitialData(business);

      setTaxClearanceCertificateData({
        requestingAgencyId,
        businessName,
        addressLine1,
        addressLine2,
        addressCity,
        addressZipCode,
        addressState,
        taxId,
        encryptedTaxId,
        taxPin,
        encryptedTaxPin,
        hasPreviouslyReceivedCertificate,
        lastUpdatedISO,
      });

      // React 19: Use callback to avoid stale closure values during batched updates
      setProfileData((latestProfileData) => {
        // Only initialize if not already set (first render)
        if (latestProfileData.taxId) {
          return latestProfileData; // User has already typed, don't overwrite
        }
        return {
          ...latestProfileData,
          businessName,
          taxId,
          encryptedTaxId,
          taxPin,
          encryptedTaxPin,
        };
      });

      setAddressData((latestAddressData) => ({
        ...latestAddressData,
        addressLine1: latestAddressData.addressLine1 || addressLine1,
        addressLine2: latestAddressData.addressLine2 || addressLine2,
        addressCity: latestAddressData.addressCity || addressCity,
        addressState: latestAddressData.addressState || addressState,
        addressZipCode: latestAddressData.addressZipCode || addressZipCode,
      }));
    }
  }, business);

  const {
    isValid,
    getInvalidFieldIds,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  // React 19 fix: Memoize context values to prevent unnecessary re-renders that cause component remounts
  const taxClearanceContextValue = useMemo(
    () => ({
      state: taxClearanceCertificateData,
      setTaxClearanceCertificateData,
    }),
    [taxClearanceCertificateData],
  );

  const profileContextValue = useMemo(
    () => ({
      state: {
        profileData: profileData,
        flow: getFlow(profileData),
      },
      setProfileData: setProfile,
      onBack: (): void => {},
    }),
    [profileData, setProfile],
  );

  const addressContextValue = useMemo(
    () => ({
      state: { formationAddressData },
      setAddressData: setAddress,
    }),
    [formationAddressData, setAddress],
  );

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <TaxClearanceCertificateDataContext.Provider value={taxClearanceContextValue}>
        <ProfileDataContext.Provider value={profileContextValue}>
          <AddressContext.Provider value={addressContextValue}>
            <div className="min-height-38rem">
              <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
                <div className="padding-y-4 margin-x-4 margin-bottom-2">
                  <Heading level={1}>{props.anytimeAction.name}</Heading>
                </div>
              </div>
              <form onSubmit={onSubmit}>
                <TaxClearanceSteps
                  certificatePdfBlob={certificatePdfBlob}
                  setCertificatePdfBlob={setCertificatePdfBlob}
                  saveTaxClearanceCertificateData={saveTaxClearanceCertificateData}
                  isValid={isValid}
                  getInvalidFieldIds={getInvalidFieldIds}
                  CMS_ONLY_stepIndex={props.CMS_ONLY_stepIndex}
                />
              </form>
            </div>
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </TaxClearanceCertificateDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
