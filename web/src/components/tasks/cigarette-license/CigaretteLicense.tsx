import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskHeader } from "@/components/TaskHeader";
import { GeneralInfo } from "@/components/tasks/cigarette-license/GeneralInfo";
import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { getInitialData } from "@/components/tasks/cigarette-license/helpers";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
  pickData,
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
import { ConfirmationPage } from "@/components/tasks/cigarette-license/Confirmation";

type Props = {
  task: Task;
  CMS_ONLY_stepIndex?: number;
  CMS_ONLY_show_error?: boolean;
};

export const CigaretteLicense = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const { state: formContextState } = useFormContextHelper(createDataFormErrorMap());

  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);
  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);
  const [cigaretteLicenseData, setCigaretteLicenseData] =
    useState<CigaretteLicenseData>(emptyCigaretteLicenseData);

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
      setCigaretteLicenseData({
        ...cigaretteLicenseData,
        ...relevantFields,
      });

      return newAddress;
    });
  };
  const { business, userData } = useUserData();

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

      setCigaretteLicenseData({
        ...cigaretteLicenseData,
        businessName: profileData.businessName,
        responsibleOwnerName: profileData.responsibleOwnerName,
        tradeName: profileData.tradeName,
        taxId: profileData.taxId,
        encryptedTaxId: profileData.taxId,
      });

      return profileData;
    });
  };

  useMountEffectWhenDefined(() => {
    if (business && userData) {
      const {
        businessName,
        responsibleOwnerName,
        tradeName,
        taxId,
        encryptedTaxId,
        addressLine1,
        addressLine2,
        addressCity,
        addressState,
        addressZipCode,
        mailingAddressIsTheSame,
        mailingAddressLine1,
        mailingAddressLine2,
        mailingAddressCity,
        mailingAddressState,
        mailingAddressZipCode,
        contactName,
        contactPhoneNumber,
        contactEmail,
        salesInfoStartDate,
        salesInfoSupplier,
        lastUpdatedISO,
      } = getInitialData(userData, business);

      setCigaretteLicenseData({
        businessName,
        responsibleOwnerName,
        tradeName,
        taxId,
        encryptedTaxId,
        addressLine1,
        addressLine2,
        addressCity,
        addressState,
        addressZipCode,
        mailingAddressIsTheSame,
        mailingAddressLine1,
        mailingAddressLine2,
        mailingAddressCity,
        mailingAddressState,
        mailingAddressZipCode,
        contactName,
        contactPhoneNumber,
        contactEmail,
        salesInfoStartDate,
        salesInfoSupplier,
        lastUpdatedISO,
      });

      setProfileData({
        ...profileData,
        businessName,
        responsibleOwnerName,
        tradeName,
        taxId,
        encryptedTaxId,
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

  if (
    business?.cigaretteLicenseData?.paymentInfo?.orderId &&
    business?.cigaretteLicenseData?.paymentInfo?.confirmationEmailsent
  ) {
    return (
      <div className="flex flex-column space-between min-height-38rem">
        <TaskHeader task={props.task} />
        <ConfirmationPage business={business} />
      </div>
    );
  }

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
      <DataFormErrorMapContext.Provider value={formContextState}>
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
                state: { formationAddressData },
                setAddressData: setAddress,
              }}
            >
              {stepIndex === 0 && <GeneralInfo setStepIndex={setStepIndex} />}
              {stepIndex === 1 && (
                <LicenseeInfo
                  setStepIndex={setStepIndex}
                  CMS_ONLY_show_error={props.CMS_ONLY_show_error}
                />
              )}
              {stepIndex === 2 && <></>}
            </AddressContext.Provider>
          </ProfileDataContext.Provider>
        </CigaretteLicenseContext.Provider>
      </DataFormErrorMapContext.Provider>
    </>
  );
};
