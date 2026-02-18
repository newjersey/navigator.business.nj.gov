import { Alert } from "@/components/njwds-extended/Alert";
import { ContactInformationTab } from "@/components/profile/ContactInformationTab";
import { getProfileErrorAlertText } from "@/components/profile/getProfileErrorAlertText";
import { ProfileTabHeader } from "@/components/profile/ProfileTabHeader";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, RefObject } from "react";

interface Props {
  fieldErrors: string[];
  profileAlertRef?: RefObject<HTMLDivElement | null>;
}

export const ContactTabPanel = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { fieldErrors, profileAlertRef } = props;

  const contactFieldIds = new Set(["name", "email", "phoneNumber"]);
  const contactFieldErrorIds = fieldErrors.filter((field: string) => contactFieldIds.has(field));

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
        <Alert variant="error" ref={profileAlertRef}>
          <div>{getProfileErrorAlertText(contactFieldErrorIds.length)}</div>
          <ul>
            {contactFieldErrorIds.map((fieldId) => (
              <li key={fieldId}>{getLabel(fieldId)}</li>
            ))}
          </ul>
        </Alert>
      )}
      <ContactInformationTab />
    </div>
  );
};
