import { Content } from "@/components/Content";
import { OnboardingBusinessName } from "@/components/onboarding/OnboardingBusinessName";
import { OnboardingTaxId } from "@/components/onboarding/OnboardingTaxId";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { postTaxRegistrationOnboarding } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyProfileData, ProfileData, UserData } from "@businessnjgovnavigator/shared";
import { Backdrop, CircularProgress } from "@mui/material";
import { ReactElement, useState } from "react";
import { useUserData } from "../lib/data-hooks/useUserData";
import { createProfileFieldErrorMap, ProfileFieldErrorMap, ProfileFields } from "../lib/types/types";
import { ModalTwoButton } from "./ModalTwoButton";
import { Alert } from "./njwds-extended/Alert";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSuccess: () => void;
}
export const Gov2GoModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData, update } = useUserData();
  const [profileData, setProfileData] = useState<ProfileData>(createEmptyProfileData());

  const fields: ProfileFields[] = ["businessName", "taxId"];

  const errorMessages: Partial<Record<ProfileFields, string>> = {
    businessName: Config.dashboardDefaults.taxCalendarModalBusinessFieldErrorName,
    taxId: Config.dashboardDefaults.taxCalendarModalTaxErrorName,
  };

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [fieldStates, setFieldStates] = useState<ProfileFieldErrorMap>(createProfileFieldErrorMap());

  const [apiFailed, setOnAPIfailed] = useState<undefined | "FAILED" | "UNKNOWN">(undefined);
  const [onSubmitClicked, setOnSubmitClicked] = useState<boolean>(false);

  const getErrors = () => ({
    businessName: { invalid: profileData.businessName.trim().length === 0 },
    taxId: { invalid: profileData.taxId?.trim().length != 12 ?? true },
  });

  const hasErrors = (errors?: Partial<ProfileFieldErrorMap>) =>
    fields.some((i) => (errors ?? fieldStates)[i]?.invalid == true);

  const onValidation = (field: ProfileFields, invalid: boolean) => {
    setFieldStates({ ...fieldStates, [field]: { ...fieldStates[field], invalid } });
  };

  const onSubmit = async () => {
    if (!userData) return;
    setOnSubmitClicked(true);
    const errors = getErrors();
    setFieldStates((prev) => ({ ...prev, ...errors }));
    if (hasErrors(errors)) return;
    setIsLoading(true);
    let userDataToSet: UserData;
    try {
      userDataToSet = await postTaxRegistrationOnboarding({
        taxId: profileData.taxId as string,
        businessName: profileData.businessName,
      });
    } catch {
      setOnAPIfailed("UNKNOWN");
      setIsLoading(false);
      return;
    }
    userDataToSet = {
      ...userDataToSet,
      profileData: { ...userDataToSet.profileData, taxId: profileData.taxId },
    };

    await update(userDataToSet);
    if (userDataToSet.taxFilingData.state == "SUCCESS") {
      setIsLoading(false);
      props.onSuccess();
    }

    if (userDataToSet.taxFilingData.state == "PENDING") {
      setIsLoading(false);
      props.close();
    }

    if (userDataToSet.taxFilingData.state == "FAILED") {
      setFieldStates((prev) => ({
        ...fields.reduce(
          (p, c) => {
            p[c] = { ...p[c], invalid: true };
            return p;
          },
          { ...prev }
        ),
      }));
      setOnAPIfailed("FAILED");
      setIsLoading(false);
    }

    if (userDataToSet.taxFilingData.state == "API_ERROR") {
      setOnAPIfailed("UNKNOWN");
      setIsLoading(false);
    }
  };

  useMountEffectWhenDefined(() => {
    if (userData) {
      setProfileData(userData.profileData);
    }
  }, userData);

  const onClose = () => {
    props.close();
    userData && setProfileData(userData.profileData);
    setOnAPIfailed(undefined);
    setOnSubmitClicked(false);
    setFieldStates(createProfileFieldErrorMap());
  };

  return (
    <ProfileDataContext.Provider
      value={{
        state: {
          profileData: profileData,
          flow: "OWNING",
          municipalities: [],
        },
        setUser: () => {},
        setProfileData,
        onBack: () => {},
      }}
    >
      <Backdrop sx={{ zIndex: 20000 }} open={isLoading}>
        <CircularProgress aria-label="Loading indicator" aria-busy={true} />
      </Backdrop>
      <ModalTwoButton
        isOpen={props.isOpen}
        close={onClose}
        title={Config.dashboardDefaults.taxCalendarModalHeader}
        primaryButtonText={Config.dashboardDefaults.taxCalendarModalNextButton}
        primaryButtonOnClick={onSubmit}
        secondaryButtonText={Config.dashboardDefaults.taxCalendarModalPreviousButton}
      >
        {hasErrors() && onSubmitClicked && !apiFailed ? (
          <Alert variant={"error"}>
            {Config.dashboardDefaults.taxCalendarModalErrorHeader}
            <ul>
              {fields.map((i) => {
                if (fieldStates[i].invalid && errorMessages[i]) {
                  return <li key={i}> {errorMessages[i]}</li>;
                }
              })}
            </ul>
          </Alert>
        ) : (
          <></>
        )}
        {apiFailed ? (
          <Alert variant={"error"}>
            {" "}
            <Content>
              {apiFailed == "FAILED"
                ? Config.dashboardDefaults.taxCalendarFailedErrorMessageMarkdown
                : Config.dashboardDefaults.taxCalendarFailedUnknownMarkdown}
            </Content>
          </Alert>
        ) : (
          <></>
        )}
        <Content>{Config.dashboardDefaults.taxCalendarModalBody}</Content>
        <OnboardingBusinessName
          className="margin-top-4"
          inputErrorBar
          onValidation={onValidation}
          fieldStates={fieldStates}
          headerMarkdown={Config.dashboardDefaults.taxCalendarModalBusinessFieldHeader}
          descriptionMarkdown={Config.dashboardDefaults.taxCalendarModalBusinessFieldMarkdown}
          validationText={
            apiFailed == "FAILED" ? Config.dashboardDefaults.taxCalendarFailedBusinessFieldHelper : undefined
          }
          disabled={userData?.formationData.completedFilingPayment}
        />
        <OnboardingTaxId
          className="margin-top-1"
          onValidation={onValidation}
          inputErrorBar
          splitField
          descriptionMarkdown={Config.dashboardDefaults.taxCalendarModalTaxIdMarkdown}
          headerMarkdown={Config.dashboardDefaults.taxCalendarModalTaxIdHeader}
          fieldStates={fieldStates}
          validationText={
            apiFailed == "FAILED" ? Config.dashboardDefaults.taxCalendarFailedTaxIdHelper : undefined
          }
          required
        />
      </ModalTwoButton>
    </ProfileDataContext.Provider>
  );
};
