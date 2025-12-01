import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { HorizontalLine } from "@/components/HorizontalLine";
import { ProfileSubSection } from "@/components/profile/ProfileSubSection";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import {
  FullNameErrorVariant,
  getFullNameErrorVariant,
  isFullNameValid,
} from "@/lib/domain-logic/isFullNameValid";
import {
  getPhoneNumberFormat,
  validateEmail,
  validateOptionalPhoneNumber,
} from "@/lib/utils/helpers";
import { BusinessUser } from "@businessnjgovnavigator/shared/businessUser";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useEffect, useRef, useState } from "react";

export const ContactInformationTab = (): ReactElement => {
  const { Config } = useConfig();
  const { userData, updateQueue, refresh } = useUserData();
  const [user, setUser] = useState<BusinessUser | undefined>(undefined);
  const savedUserRef = useRef<BusinessUser | undefined>(undefined);
  const hasRefreshedRef = useRef(false);

  useEffect(() => {
    if (!updateQueue || hasRefreshedRef.current) return;
    hasRefreshedRef.current = true;
    void refresh();
  }, [updateQueue, refresh]);

  useEffect(() => {
    if (!userData?.user) return;

    if (savedUserRef.current) {
      setUser(userData.user);
    } else {
      savedUserRef.current = userData.user;
      setUser(userData.user);
    }
  }, [userData]);

  const emailFormContextHelpers = useFormContextFieldHelpers("email", DataFormErrorMapContext, []);

  const nameFormContextHelpers = useFormContextFieldHelpers("name", DataFormErrorMapContext, []);

  const phoneNumberFormContextHelpers = useFormContextFieldHelpers(
    "phoneNumber",
    DataFormErrorMapContext,
    [],
  );

  emailFormContextHelpers.RegisterForOnSubmit(() =>
    user?.email ? validateEmail(user.email) : false,
  );
  nameFormContextHelpers.RegisterForOnSubmit(
    () => getFullNameErrorVariant(user?.name) === "NO_ERROR",
  );
  phoneNumberFormContextHelpers.RegisterForOnSubmit(() =>
    validateOptionalPhoneNumber(user?.phoneNumber || ""),
  );

  const FullNameErrorMessageLookup: Record<FullNameErrorVariant, string> = {
    MISSING: Config.selfRegistration.errorTextFullName,
    TOO_LONG: Config.selfRegistration.errorTextFullNameLength,
    MUST_START_WITH_LETTER: Config.selfRegistration.errorTextFullNameStartWithLetter,
    CONTAINS_ILLEGAL_CHAR: Config.selfRegistration.errorTextFullNameSpecialCharacter,
    NO_ERROR: "",
  };

  const updateUserData = (updatedUser: BusinessUser): void => {
    if (!updateQueue) return;

    updateQueue.queueUser(updatedUser);
  };

  const updateUserField = <K extends keyof BusinessUser>(
    field: K,
    value: BusinessUser[K],
  ): void => {
    if (!user) return;
    const updatedUser = { ...user, [field]: value };
    setUser(updatedUser);
    updateUserData(updatedUser);
  };

  type NotificationFieldName = "receiveUpdatesAndReminders" | "receiveNewsletter" | "userTesting";

  type NotificationTextKey =
    | "notificationIncompleteTasksLabel"
    | "notificationIncompleteTasksDescription"
    | "notificationNewsletterLabel"
    | "notificationNewsletterDescription"
    | "notificationProductNewsLabel"
    | "notificationProductNewsDescription";

  const renderNotificationCheckbox = (
    fieldName: NotificationFieldName,
    checkboxId: string,
    labelKey: NotificationTextKey,
    descriptionKey: NotificationTextKey,
  ): ReactElement => {
    if (!user) return <></>;
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={user[fieldName]}
            onChange={(event): void => updateUserField(fieldName, event.target.checked)}
            id={checkboxId}
          />
        }
        label={
          <div>
            <div className="text-bold">{Config.profileDefaults.default[labelKey]}</div>
            <div className="text-italic">{Config.profileDefaults.default[descriptionKey]}</div>
          </div>
        }
      />
    );
  };

  if (!user) {
    return <></>;
  }

  return (
    <div>
      <ProfileSubSection
        heading={Config.profileDefaults.default.contactInformationHeading}
        subText={Config.profileDefaults.default.contactInformationSubText}
        hideDivider
      >
        <div>
          <div className="margin-top-2">
            <WithErrorBar hasError={nameFormContextHelpers.isFormFieldInvalid} type="ALWAYS">
              <label htmlFor="profile-name" className="text-bold">
                {Config.selfRegistration.nameFieldLabel}
              </label>
              <GenericTextField
                value={user.name || ""}
                formContext={DataFormErrorMapContext}
                fieldName={"name"}
                error={nameFormContextHelpers.isFormFieldInvalid}
                validationText={FullNameErrorMessageLookup[getFullNameErrorVariant(user.name)]}
                required={true}
                handleChange={(name): void => updateUserField("name", name)}
                additionalValidationIsValid={isFullNameValid}
                inputWidth="default"
              />
            </WithErrorBar>
          </div>
          <div className="margin-top-2">
            <WithErrorBar hasError={emailFormContextHelpers.isFormFieldInvalid} type="ALWAYS">
              <label htmlFor="profile-email" className="text-bold">
                {Config.selfRegistration.emailFieldLabel}
              </label>
              <GenericTextField
                value={user.email || ""}
                fieldName={"email"}
                formContext={DataFormErrorMapContext}
                error={emailFormContextHelpers.isFormFieldInvalid}
                handleChange={(email): void => updateUserField("email", email)}
                onValidation={(_, invalid): void => emailFormContextHelpers.setIsValid(!invalid)}
                validationText={
                  emailFormContextHelpers.isFormFieldInvalid
                    ? Config.profileDefaults.default.errorTextEmail
                    : ""
                }
                required={true}
                additionalValidationIsValid={validateEmail}
                inputWidth="default"
              />
            </WithErrorBar>
          </div>
          <WithErrorBar hasError={phoneNumberFormContextHelpers.isFormFieldInvalid} type="ALWAYS">
            <div className="margin-top-2">
              <label htmlFor="profile-phoneNumber" className="text-bold">
                {Config.selfRegistration.phoneNumberFieldLabel}
              </label>
              {Config.selfRegistration.phoneNumberFieldLabelOptional && (
                <span className="margin-left-1">
                  {Config.selfRegistration.phoneNumberFieldLabelOptional}
                </span>
              )}
              <GenericTextField
                value={user.phoneNumber || ""}
                fieldName={"phoneNumber"}
                formContext={DataFormErrorMapContext}
                error={phoneNumberFormContextHelpers.isFormFieldInvalid}
                handleChange={(phoneNumber): void => updateUserField("phoneNumber", phoneNumber)}
                onValidation={(_, invalid): void =>
                  phoneNumberFormContextHelpers.setIsValid(!invalid)
                }
                validationText={
                  phoneNumberFormContextHelpers.isFormFieldInvalid
                    ? Config.selfRegistration.errorTextPhoneNumber
                    : ""
                }
                required={false}
                inputWidth="default"
                visualFilter={getPhoneNumberFormat}
                numericProps={{ maxLength: 10, minLength: 0 }}
                additionalValidationIsValid={validateOptionalPhoneNumber}
                autoComplete="tel"
              />
            </div>
          </WithErrorBar>
        </div>
      </ProfileSubSection>

      <ProfileSubSection
        heading={Config.profileDefaults.default.typesOfNotificationsHeading}
        subText={Config.profileDefaults.default.typesOfNotificationsSubText}
        hideDivider
      >
        <div className="margin-top-neg-2">
          <FormGroup>
            {renderNotificationCheckbox(
              "receiveUpdatesAndReminders",
              "updatesAndRemindersCheckbox",
              "notificationIncompleteTasksLabel",
              "notificationIncompleteTasksDescription",
            )}
            {renderNotificationCheckbox(
              "receiveNewsletter",
              "newsletterCheckbox",
              "notificationNewsletterLabel",
              "notificationNewsletterDescription",
            )}
            {renderNotificationCheckbox(
              "userTesting",
              "productNewsCheckbox",
              "notificationProductNewsLabel",
              "notificationProductNewsDescription",
            )}
          </FormGroup>
        </div>
      </ProfileSubSection>

      <div className="margin-top-4">
        <div className="bg-base-extra-light padding-3 margin-top-4 radius-lg">
          <div className="flex">
            <div className="callout-quickReference-icon" aria-hidden="true" />
            <div className="flex-1">
              <div className="text-bold">
                {Config.profileDefaults.default.securityMattersHeading}
              </div>
              <Content>{Config.profileDefaults.default.securityMattersText}</Content>
            </div>
          </div>
        </div>
      </div>

      <HorizontalLine customMargin="margin-top-8" />
    </div>
  );
};
