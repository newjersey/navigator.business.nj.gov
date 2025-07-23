import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskHeader } from "@/components/TaskHeader";
import { GeneralInfo } from "@/components/tasks/cigarette-license/GeneralInfo";
import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { LicenseeInfo2 } from "@/components/tasks/cigarette-license/LicenseeInfo2";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { StepperStep, Task } from "@/lib/types/types";
import { getFlow, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import {
  emptyFormationAddressData,
  FormationAddress,
} from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { Dispatch, ReactElement, SetStateAction, useState } from "react";

type Props = {
  task: Task;
  CMS_ONLY_stepIndex?: number;
};

export const CigaretteLicense = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);
  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);

  const setAddress: Dispatch<SetStateAction<FormationAddress>> = (action) => {
    setAddressData((prevAddress) => {
      const newAddress =
        typeof action === "function"
          ? (action as (prevState: FormationAddress) => FormationAddress)(prevAddress)
          : action;

      // const relevantFields = pickData(newAddress, [
      //   "addressLine1",
      //   "addressLine2",
      //   "addressCity",
      //   "addressState",
      //   "addressZipCode",
      // ]);
      // setTaxClearanceCertificateData({
      //   ...taxClearanceCertificateData,
      //   ...relevantFields,
      // });

      return newAddress;
    });
  };
  // const { business, userData } = useUserData();
  const { business } = useUserData();

  const [cigaretteLicenseData, setCigaretteLicenseData] =
    useState<CigaretteLicenseData>(emptyCigaretteLicenseData);

  const stepperSteps: StepperStep[] = [
    {
      name: Config.cigaretteLicenseShared.stepperOneLabel,
      hasError: false,
      isComplete: false,
    },
    {
      name: Config.cigaretteLicenseShared.stepperTwoLabel,
      hasError: false,
      isComplete: false,
    },
    {
      name: Config.cigaretteLicenseShared.stepperThreeLabel,
      hasError: false,
      isComplete: false,
    },
    {
      name: Config.cigaretteLicenseShared.stepperFourLabel,
      hasError: false,
      isComplete: false,
    },
  ];

  const setProfile: Dispatch<SetStateAction<ProfileData>> = (action) => {
    setProfileData((prevProfileData) => {
      const profileData =
        typeof action === "function"
          ? (action as (prevState: ProfileData) => ProfileData)(prevProfileData)
          : action;

      return profileData;
    });
  };

  useMountEffectWhenDefined(() => {
    if (business) {
      setProfileData({
        ...profileData,
        businessName: business.profileData.businessName,
        taxId: business.profileData.taxId,
        encryptedTaxId: business.profileData.encryptedTaxId,
      });

      // Initialize formationAddressData with business address data
      // setAddressDataWithSync({
      //   addressLine1: business.formationData?.formationFormData?.addressLine1 || "",
      //   addressLine2: business.formationData?.formationFormData?.addressLine2 || "",
      //   addressCity: business.formationData?.formationFormData?.addressMunicipality?.name || "",
      //   addressState: business.formationData?.formationFormData?.addressState || undefined,
      //   addressZipCode: business.formationData?.formationFormData?.addressZipCode || "",
      //   addressCountry: business.formationData?.formationFormData?.addressCountry || undefined,
      //   businessLocationType:
      //     business.formationData?.formationFormData?.businessLocationType || undefined,
      // });
    }
  }, business);

  console.log(formContextState);
  return (
    <>
      <TaskHeader task={props.task} />
      <HorizontalStepper
        steps={stepperSteps}
        currentStep={stepIndex}
        onStepClicked={function (step: number): void {
          setStepIndex(step);
        }}
      />
      <CigaretteLicenseContext.Provider
        value={{
          state: cigaretteLicenseData,
          setCigaretteLicenseData,
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
              state: {
                formationAddressData: formationAddressData,
              },
              setAddressData: setAddress,
            }}
          >
            <DataFormErrorMapContext.Provider value={formContextState}>
              {stepIndex === 0 && <GeneralInfo setStepIndex={setStepIndex} />}
              {stepIndex === 1 && <LicenseeInfo setStepIndex={setStepIndex} />}
              {stepIndex === 2 && <LicenseeInfo2 setStepIndex={setStepIndex} />}
            </DataFormErrorMapContext.Provider>
          </AddressContext.Provider>
        </ProfileDataContext.Provider>
      </CigaretteLicenseContext.Provider>
    </>
  );
};
