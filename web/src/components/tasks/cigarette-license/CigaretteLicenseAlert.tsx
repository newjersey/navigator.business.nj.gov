import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { CigaretteLicenseData } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { ReactElement } from "react";

interface Props {
  fieldErrors: string[];
  hasResponseError?: boolean;
  setStepIndex: (step: number) => void;
}

type CigaretteLicenseKey = Exclude<
  keyof CigaretteLicenseData,
  "encryptedTaxId" | "lastUpdatedISO" | "mailingAddressIsTheSame" | "paymentInfo"
>;

export const CigaretteLicenseAlert = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const getLabel = (key: CigaretteLicenseKey): string =>
    Config.cigaretteLicenseShared.alertFieldNames[key] ?? key;

  const getStepIndex = (key: CigaretteLicenseKey): number => {
    switch (key) {
      case "signerName":
        return 3;
      case "signerRelationship":
        return 3;
      case "signature":
        return 3;
      case "salesInfoStartDate":
        return 2;
      case "salesInfoSupplier":
        return 2;
      default:
        return 1;
    }
  };

  const hasErrors = props.fieldErrors.length > 0 || props.hasResponseError;

  return hasErrors ? (
    <Alert className="margin-top-4" variant="error" dataTestid={"cigarette-license-error-alert"}>
      {props.fieldErrors.length > 0 && (
        <>
          <div>
            {props.fieldErrors.length > 0 && (
              <Content>{Config.cigaretteLicenseShared.alertInvalidFields}</Content>
            )}
          </div>
          <ul>
            {props.fieldErrors.map((id) => (
              <li key={`${id}`} id={`label-${id}`}>
                <a
                  onClick={() => {
                    props.setStepIndex(getStepIndex(id as CigaretteLicenseKey));
                  }}
                  href={`#question-${id}`}
                >
                  {getLabel(id as CigaretteLicenseKey)}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {props.hasResponseError && (
        <div data-testid="cigarette-license-response-error">
          <Content>{Config.cigaretteLicenseShared.alertPaymentError}</Content>
        </div>
      )}
    </Alert>
  ) : (
    <></>
  );
};
