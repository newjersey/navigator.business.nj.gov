import { Heading } from "@/components/njwds-extended/Heading";
import { getInitialData } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { TaxClearanceSteps } from "@/components/tasks/anytime-action/tax-clearance-certificate/TaxClearanceSteps";
import { AddressContext } from "@/contexts/addressContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
  pickData,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { TaxClearanceCertificateDataContext } from "@/contexts/taxClearanceCertificateDataContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import { getFlow, scrollToTop, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { emptyTaxClearanceCertificateData } from "@businessnjgovnavigator/shared";
import {
  emptyFormationAddressData,
  FormationAddress,
} from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Dispatch, ReactElement, SetStateAction, useState } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
  CMS_ONLY_certificatePdfBlob?: Blob;
}

export const AnytimeActionTaxClearanceCertificate = (props: Props): ReactElement => {
  const { business, updateQueue } = useUserData();
  const [taxClearanceCertificateData, setTaxClearanceCertificateData] = useState(
    emptyTaxClearanceCertificateData,
  );
  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);

  const setAddress: Dispatch<SetStateAction<FormationAddress>> = (action) => {
    setAddressData((prevAddress) => {
      const newAddress =
        typeof action === "function"
          ? (action as (prevState: FormationAddress) => FormationAddress)(prevAddress)
          : action;

      const relevantFields = pickData(newAddress, [
        "addressLine1",
        "addressLine2",
        "addressCity",
        "addressState",
        "addressZipCode",
      ]);
      setTaxClearanceCertificateData({
        ...taxClearanceCertificateData,
        ...relevantFields,
      });

      return newAddress;
    });
  };

  const setProfile: Dispatch<SetStateAction<ProfileData>> = (action) => {
    setProfileData((prevProfileData) => {
      const profileData =
        typeof action === "function"
          ? (action as (prevState: ProfileData) => ProfileData)(prevProfileData)
          : action;

      const relevantFields = pickData(profileData, ["businessName", "taxId", "taxPin"]);
      setTaxClearanceCertificateData({
        ...taxClearanceCertificateData,
        ...relevantFields,
      });

      return profileData;
    });
  };

  const saveTaxClearanceCertificateData = (): void => {
    updateQueue
      ?.queueBusiness({
        ...updateQueue.currentBusiness(),
        taxClearanceCertificateData,
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
      });

      setProfileData({
        ...profileData,
        businessName,
        taxId,
        encryptedTaxId,
        taxPin,
        encryptedTaxPin,
      });

      setAddressData({
        ...formationAddressData,
        addressLine1,
        addressLine2,
        addressCity,
        addressState,
        addressZipCode,
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
    () => {},
  );

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
            setProfileData: setProfile,
            onBack: (): void => {},
          }}
        >
          <AddressContext.Provider
            value={{
              state: { formationAddressData },
              setAddressData: setAddress,
            }}
          >
            <div className="min-height-38rem">
              <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
                <div className="padding-y-4 margin-x-4 margin-bottom-2">
                  <Heading level={1}>{props.anytimeAction.name}</Heading>
                </div>
              </div>
              <TaxClearanceSteps
                taxClearanceCertificateData={taxClearanceCertificateData}
                certificatePdfBlob={props.CMS_ONLY_certificatePdfBlob}
                saveTaxClearanceCertificateData={saveTaxClearanceCertificateData}
                isValid={isValid}
                getInvalidFieldIds={getInvalidFieldIds}
                onSubmit={onSubmit}
                CMS_ONLY_stepIndex={props.CMS_ONLY_stepIndex}
              />
            </div>
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </TaxClearanceCertificateDataContext.Provider>
    </DataFormErrorMapContext.Provider>
  );
};
