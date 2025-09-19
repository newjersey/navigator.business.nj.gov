import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { TaskHeader } from "@/components/TaskHeader";
import { CigaretteLicenseAlert } from "@/components/tasks/cigarette-license/CigaretteLicenseAlert";
import { CigaretteLicenseReview } from "@/components/tasks/cigarette-license/CigaretteLicenseReview";
import { ConfirmationPage } from "@/components/tasks/cigarette-license/Confirmation";
import { GeneralInfo } from "@/components/tasks/cigarette-license/GeneralInfo";
import {
  getInitialData,
  isAnyRequiredFieldEmpty,
} from "@/components/tasks/cigarette-license/helpers";
import { LicenseeInfo } from "@/components/tasks/cigarette-license/LicenseeInfo";
import { SalesInfo } from "@/components/tasks/cigarette-license/SalesInfo";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
  pickData,
} from "@/contexts/dataFormErrorMapContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUpdateTaskProgress } from "@/lib/data-hooks/useUpdateTaskProgress";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { checkQueryValue, QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { getFlow, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  CigaretteLicenseData,
  emptyCigaretteLicenseData,
  SubmissionError,
} from "@businessnjgovnavigator/shared/cigaretteLicense";
import {
  emptyFormationAddressData,
  FormationAddress,
} from "@businessnjgovnavigator/shared/formationData";
import { emptyProfileData, ProfileData } from "@businessnjgovnavigator/shared/profileData";
import { StepperStep, Task } from "@businessnjgovnavigator/shared/types";
import { useRouter } from "next/compat/router";
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Props = {
  task: Task;
  CMS_ONLY_stepIndex?: number;
  CMS_ONLY_show_error?: boolean;
};

export const CigaretteLicense = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const { business, userData, updateQueue } = useUserData();
  const { queueUpdateTaskProgress } = useUpdateTaskProgress();
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<SubmissionError>(undefined);
  const { getInvalidFieldIds, state: formContextState } =
    useFormContextHelper(createDataFormErrorMap());
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);

  const [profileData, setProfileData] = useState<ProfileData>(emptyProfileData);
  const [formationAddressData, setAddressData] =
    useState<FormationAddress>(emptyFormationAddressData);
  const [cigaretteLicenseData, setCigaretteLicenseData] =
    useState<CigaretteLicenseData>(emptyCigaretteLicenseData);

  const errorAlertRef = useRef<HTMLDivElement>(null);

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

  const doesStepHaveError = (step: number): boolean => {
    const invalidFieldIds = getInvalidFieldIds();
    if (invalidFieldIds.length === 0) {
      return false;
    }

    const stepFields: Record<number, string[]> = {
      1: [
        "addressLine1",
        "addressLine2",
        "addressCity",
        "addressState",
        "addressZipCode",
        "contactName",
        "contactPhoneNumber",
        "contactEmail",
        "responsibleOwnerName",
        "tradeName",
        "taxId",
        "businessName",
        "mailingAddressLine1",
        "mailingAddressLine2",
        "mailingAddressCity",
        "mailingAddressState",
        "mailingAddressZipCode",
      ],
      2: ["salesInfoStartDate", "salesInfoSupplier"],
      3: ["signature", "signerRelationship", "signerName"],
    };

    return stepFields[step]?.some((fieldId) => invalidFieldIds.includes(fieldId)) ?? false;
  };

  const stepperSteps: StepperStep[] = [
    {
      name: Config.cigaretteLicenseShared.stepperOneLabel,
      hasError: false,
      isComplete: stepIndex > 0,
    },
    {
      name: Config.cigaretteLicenseShared.stepperTwoLabel,
      hasError: doesStepHaveError(1),
      isComplete: !isAnyRequiredFieldEmpty(
        cigaretteLicenseData,
        1,
        business?.profileData.legalStructureId,
      ),
    },
    {
      name: Config.cigaretteLicenseShared.stepperThreeLabel,
      hasError: doesStepHaveError(2),
      isComplete: !isAnyRequiredFieldEmpty(
        cigaretteLicenseData,
        2,
        business?.profileData.legalStructureId,
      ),
    },
    {
      name: Config.cigaretteLicenseShared.stepperFourLabel,
      hasError: doesStepHaveError(3),
      isComplete: !isAnyRequiredFieldEmpty(
        cigaretteLicenseData,
        3,
        business?.profileData.legalStructureId,
      ),
    },
  ];

  const handlePaymentSuccess = useCallback(() => {
    if (!updateQueue || !business) return;

    queueUpdateTaskProgress("cigarette-license", "COMPLETED");
    updateQueue
      ?.queueBusiness({
        ...updateQueue.currentBusiness(),
        cigaretteLicenseData: {
          ...business.cigaretteLicenseData,
          lastUpdatedISO: new Date(Date.now()).toISOString(),
          paymentInfo: {
            ...business.cigaretteLicenseData?.paymentInfo,
            paymentComplete: true,
          },
        },
      })
      .update();
  }, [updateQueue, business, queueUpdateTaskProgress]);

  useEffect(() => {
    if (!router?.isReady) return;

    if (
      checkQueryValue(router, QUERIES.completePayment, "failure") ||
      checkQueryValue(router, QUERIES.completePayment, "duplicate")
    ) {
      setStepIndex(3);
      setSubmissionError("PAYMENT");
    }
    if (checkQueryValue(router, QUERIES.completePayment, "cancel")) {
      setStepIndex(3);
    }
    if (checkQueryValue(router, QUERIES.completePayment, "success")) {
      handlePaymentSuccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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

  const saveCigaretteLicenseData = (): void => {
    if (!business) {
      return;
    }
    updateQueue
      ?.queueBusiness({
        ...updateQueue.currentBusiness(),
        cigaretteLicenseData: {
          ...cigaretteLicenseData,
        },
        lastUpdatedISO: new Date(Date.now()).toISOString(),
      })
      .update();
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
        signerName,
        signerRelationship,
        signature,
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
        signerName,
        signerRelationship,
        signature,
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

  const shouldShowConfirmation = (): boolean => {
    const paymentComplete = business?.cigaretteLicenseData?.paymentInfo?.paymentComplete;
    const taskComplete = business?.taskProgress["cigarette-license"] === "COMPLETED";

    return paymentComplete || taskComplete;
  };

  const fireAnalyticsEvent = (step: number): void => {
    const analyticsEvent = [
      analytics.event.cigarette_license.click.switch_to_step_one,
      analytics.event.cigarette_license.click.switch_to_step_two,
      analytics.event.cigarette_license.click.switch_to_step_three,
      analytics.event.cigarette_license.click.switch_to_step_four,
    ];
    analyticsEvent[step]();
  };

  const onStepClick = (step: number): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      updateQueue?.queuePreferences({ returnToLink: ROUTES.cigaretteLicense }).update();
      setShowNeedsAccountModal(true);
    } else {
      saveCigaretteLicenseData();
      fireAnalyticsEvent(step);
      setStepIndex(step);
    }
  };

  return shouldShowConfirmation() ? (
    <div className="flex flex-column space-between min-height-38rem">
      <TaskHeader task={props.task} />
      <ConfirmationPage business={business!} />
    </div>
  ) : (
    <>
      <TaskHeader task={props.task} />
      <CigaretteLicenseAlert
        ref={errorAlertRef}
        fieldErrors={getInvalidFieldIds()}
        setStepIndex={setStepIndex}
        submissionError={submissionError}
      />
      <HorizontalStepper steps={stepperSteps} currentStep={stepIndex} onStepClicked={onStepClick} />
      <DataFormErrorMapContext.Provider value={formContextState}>
        <CigaretteLicenseContext.Provider
          value={{
            state: cigaretteLicenseData,
            setCigaretteLicenseData,
            saveCigaretteLicenseData,
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
              {stepIndex === 2 && (
                <SalesInfo
                  setStepIndex={setStepIndex}
                  CMS_ONLY_show_error={props.CMS_ONLY_show_error}
                />
              )}
              {stepIndex === 3 && (
                <CigaretteLicenseReview
                  setStepIndex={setStepIndex}
                  setSubmissionError={setSubmissionError}
                  CMS_ONLY_show_error={props.CMS_ONLY_show_error}
                  errorAlertRef={errorAlertRef}
                />
              )}
            </AddressContext.Provider>
          </ProfileDataContext.Provider>
        </CigaretteLicenseContext.Provider>
      </DataFormErrorMapContext.Provider>
    </>
  );
};
