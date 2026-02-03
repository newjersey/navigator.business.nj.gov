import { GenericTextField } from "@/components/GenericTextField";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { WithErrorBar } from "@/components/WithErrorBar";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNaicsCode, validateEmail } from "@/lib/utils/helpers";
import { CrtkEmailMetadata } from "@businessnjgovnavigator/shared/crtk";
import { ReactElement, useState } from "react";

interface Props {
  onSearchAgain: () => void;
  setCrtkEmailSent: (sent: boolean) => void;
  setError: (error: boolean) => void;
}

export const ActivitiesForm = (props: Props): ReactElement => {
  const { business, userData, updateQueue } = useUserData();
  const { Config } = useConfig();

  const [email, setEmail] = useState(userData?.user.email || "");
  const [naicsCode, setNaicsCode] = useState(business?.profileData.naicsCode || "");
  const [businessActivities, setBusinessActivities] = useState("");
  const [materialOrProducts, setMaterialOrProducts] = useState("");

  const [confirmationModal, setConfirmationModal] = useState(false);

  const [emailError, setEmailError] = useState<boolean>(false);
  const [naicsError, setNaicsError] = useState<boolean>(false);
  const [businessActivitiesError, setBusinessActivitiesError] = useState<boolean>(false);
  const [materialsError, setMaterialsError] = useState<boolean>(false);

  const fieldErrors = (): boolean => {
    const errorsFields: string[] = [];
    if (validateEmail(email)) {
      setEmailError(false);
    } else {
      setEmailError(true);
      errorsFields.push("email");
    }
    if (naicsCode !== "" && !getNaicsCode(naicsCode)) {
      setNaicsError(true);
      errorsFields.push("naicsCode");
    } else {
      setNaicsError(false);
    }
    if (businessActivities.length < 20 || businessActivities.length > 600) {
      setBusinessActivitiesError(true);
      errorsFields.push("businessActivities");
    } else {
      setBusinessActivitiesError(false);
    }
    if (materialOrProducts.length < 20 || materialOrProducts.length > 600) {
      setMaterialsError(true);
      errorsFields.push("materials");
    } else {
      setMaterialsError(false);
    }
    return errorsFields.length > 0 ? true : false;
  };

  const onSubmit = async (): Promise<void> => {
    if (fieldErrors() === false) {
      setConfirmationModal(true);
    }
  };

  const confirmSend = async (): Promise<void> => {
    props.setError(false);
    const emailDetails: CrtkEmailMetadata = {
      username: userData?.user.name || "N/A",
      email: email,
      businessName: business?.crtkData?.crtkBusinessDetails?.businessName || "N/A",
      businessStatus: business?.profileData.businessPersona || "N/A",
      businessAddress: business?.crtkData?.crtkBusinessDetails?.addressLine1 || "N/A",
      industry: business?.profileData.industryId || "N/A",
      ein: business?.crtkData?.crtkBusinessDetails?.ein || "N/A",
      naicsCode: naicsCode || "N/A",
      businessActivities: businessActivities,
      materialOrProducts: materialOrProducts,
    };
    await api
      .sendCrtkActivitiesEmail(emailDetails)
      .then(() => {
        if (business?.crtkData !== undefined)
          updateQueue
            ?.queueBusiness({
              ...business,
              crtkData: {
                ...business?.crtkData,
                lastUpdatedISO: business?.crtkData?.lastUpdatedISO || new Date().toISOString(),
                crtkEmailSent: true,
              },
            })
            .update();
        props.setCrtkEmailSent(true);
      })
      .catch(() => {
        props.setError(true);
      });
    setConfirmationModal(false);
  };

  return (
    <div data-testid="activities-form">
      <ModalTwoButton
        isOpen={confirmationModal}
        close={() => setConfirmationModal(false)}
        title={Config?.crtkTask?.modalSendToCrtkTitle}
        primaryButtonText={Config?.crtkTask?.modalSendPrimaryButtonText}
        primaryButtonOnClick={confirmSend}
        secondaryButtonText={Config?.crtkTask?.modalSendSecondaryButtonText}
      >
        <div>{Config?.crtkTask?.sendConfirmationText}</div>
      </ModalTwoButton>
      {(emailError === true ||
        naicsError === true ||
        businessActivitiesError === true ||
        materialsError === true) && (
        <Alert variant={"error"} dataTestid="fields-error-alert">
          {Config.crtkTask.fieldsErrorText}
        </Alert>
      )}
      <div>
        <label className="text-bold margin-top-1" htmlFor="businessName">
          {Config?.crtkTask?.businessNameLabel}
        </label>
        <div id="businessName">
          {business?.crtkData?.crtkBusinessDetails?.businessName || "N/A"}
        </div>
        <div className="text-bold margin-top-1">{Config?.crtkTask?.businessStreetAddressLabel}</div>
        <div>{business?.crtkData?.crtkBusinessDetails?.addressLine1 || "N/A"}</div>
        <div className="text-bold margin-top-1">{Config?.crtkTask?.einLabel}</div>
        <div>{business?.crtkData?.crtkBusinessDetails?.ein || "N/A"}</div>
        <div className="margin-top-1">
          <label htmlFor="email" className="text-bold">
            {Config?.crtkTask?.yourEmailLabel}
          </label>
          <div>{Config?.crtkTask?.yourEmailHelper}</div>
          <WithErrorBar hasError={emailError} type="ALWAYS">
            <GenericTextField
              value={email}
              onChange={(value) => setEmail(value)}
              inputProps={{
                id: "email",
              }}
              error={emailError}
              validationText={Config?.crtkTask?.fieldsErrorText}
              fieldName={"email"}
            />
          </WithErrorBar>
        </div>
        <div className="margin-top-1">
          <label htmlFor="naicsCode" className="margin-top-1 text-bold">
            {Config?.crtkTask?.naicsCodeLabel}
          </label>
          <div>{Config?.crtkTask?.naicsCodeHelper}</div>
          <WithErrorBar hasError={naicsError} type="ALWAYS">
            <GenericTextField
              value={naicsCode}
              onChange={(value) => setNaicsCode(value)}
              inputProps={{
                id: "naicsCode",
              }}
              error={naicsError}
              validationText={Config?.crtkTask?.naicsCodeErrorText}
              fieldName={"naicsCode"}
            />
          </WithErrorBar>
        </div>
        <div className="margin-top-1">
          <label htmlFor="businessActivities" className="margin-top-1 text-bold">
            {Config?.crtkTask?.businessActivitiesLabel}
          </label>
          <div>{Config?.crtkTask?.businessActivitiesHelper}</div>
          <i>{Config?.crtkTask?.businessActivitiesExample}</i>
          <WithErrorBar hasError={businessActivitiesError} type="ALWAYS">
            <GenericTextField
              fieldOptions={{
                multiline: true,
                minRows: 3,
                maxRows: 20,
                className: "override-padding",
                error: businessActivitiesError,
                inputProps: {
                  maxLength: 600,
                  minLength: 20,
                  sx: {
                    padding: "1rem",
                  },
                },
                helperText: Config?.crtkTask?.characterCountHelper,
              }}
              value={businessActivities}
              onChange={(value) => setBusinessActivities(value)}
              inputProps={{
                id: "businessActivities",
              }}
              error={false}
              fieldName={"businessActivities"}
            />
          </WithErrorBar>
        </div>
        <div className="margin-top-1">
          <label htmlFor="materialOrProducts" className="margin-top-1 text-bold">
            {Config?.crtkTask?.materialsLabel}
          </label>
          <div>{Config?.crtkTask?.materialsHelper}</div>
          <i>{Config?.crtkTask?.materialsExample}</i>
          <WithErrorBar hasError={materialsError} type="ALWAYS">
            <GenericTextField
              fieldOptions={{
                multiline: true,
                minRows: 3,
                maxRows: 20,
                className: "override-padding",
                inputProps: {
                  maxLength: 600,
                  minLength: 20,
                  sx: {
                    padding: "1rem",
                  },
                },
                error: materialsError,
                helperText: Config?.crtkTask?.characterCountHelper,
              }}
              value={materialOrProducts}
              onChange={(value) => setMaterialOrProducts(value)}
              inputProps={{
                id: "materialOrProducts",
              }}
              error={false}
              fieldName={"materialOrProducts"}
            />
          </WithErrorBar>
        </div>
        <ActionBarLayout>
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton
              isColor="accent-cooler"
              onClick={props.onSearchAgain}
              dataTestId="cta-secondary"
            >
              {Config?.crtkTask?.goBackButtonText}
            </SecondaryButton>
          </div>
          <PrimaryButton
            isColor="accent-cooler"
            onClick={onSubmit}
            isRightMarginRemoved
            dataTestId="cta-primary"
            isSubmitButton={true}
          >
            {Config?.crtkTask?.submitButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </div>
    </div>
  );
};
