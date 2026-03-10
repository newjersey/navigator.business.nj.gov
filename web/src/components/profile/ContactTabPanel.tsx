import { Alert } from "@/components/njwds-extended/Alert";
import { ContactInformationTab } from "@/components/profile/ContactInformationTab";
import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, RefObject } from "react";

type GovDeliveryErrorType = "SUBSCRIBE_FAILED" | "UNSUBSCRIBE_FAILED" | "EMAIL_UPDATE_FAILED";

interface Props {
  fieldErrors: string[];
  profileAlertRef?: RefObject<HTMLDivElement>;
  govDeliveryError: GovDeliveryErrorType | null;
  clearGovDeliveryError: () => void;
}

export const ContactTabPanel = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const contactFieldIds = new Set(["name", "email", "phoneNumber"]);
  const contactFieldErrorIds = props.fieldErrors.filter((field: string) =>
    contactFieldIds.has(field),
  );

  const hasContactErrors = contactFieldErrorIds.length > 0;

  const getLabel = (field: string): string => {
    switch (field) {
      case "name":
        return Config.selfRegistration.nameFieldLabel;
      case "email":
        return Config.selfRegistration.emailFieldLabel;
      case "phoneNumber":
        return Config.selfRegistration.phoneNumberFieldLabel;
      default:
        return field;
    }
  };

  return (
    <div id="tabpanel-contact" role="tabpanel" aria-labelledby="tab-contact">
      <ProfileTabHeader tab="contact" />
      {hasContactErrors && (
        <Alert variant="error" ref={props.profileAlertRef}>
          <div>{getProfileErrorAlertText(contactFieldErrorIds.length)}</div>
          <ul>
            {contactFieldErrorIds.map((fieldId) => (
              <li key={fieldId}>{getLabel(fieldId)}</li>
            ))}
          </ul>
        </Alert>
      )}
      {props.govDeliveryError === "SUBSCRIBE_FAILED" && (
        <Alert variant="error">{Config.profileDefaults.default.newsletterSubscribeError}</Alert>
      )}
      {props.govDeliveryError === "UNSUBSCRIBE_FAILED" && (
        <Alert variant="error">{Config.profileDefaults.default.newsletterUnsubscribeError}</Alert>
      )}
      {props.govDeliveryError === "EMAIL_UPDATE_FAILED" && (
        <Alert variant="error">{Config.profileDefaults.default.newsletterEmailUpdateError}</Alert>
      )}
      <ContactInformationTab clearGovDeliveryError={props.clearGovDeliveryError} />
    </div>
  );
};
