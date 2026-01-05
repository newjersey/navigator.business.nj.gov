import { Content } from "@/components/Content";
import { ActivitiesForm } from "@/components/crtk/ActivitiesForm";
import { Alert } from "@/components/njwds-extended/Alert";
import { MiniCallout } from "@/components/njwds-extended/callout/MiniCallout";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval } from "@/lib/utils/helpers";

import { Checkbox } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  onSearchAgain: () => void;
  setCrtkEmailSent: (sent: boolean) => void;
}

export const BusinessActivities = (props: Props): ReactElement => {
  const [registeredBusiness, setRegisteredBusiness] = useState(false);
  const { business } = useUserData();
  const { Config } = useConfig();
  const [error, setError] = useState<boolean>(false);
  return (
    <div className={"bg-accent-cooler-50 padding-2 radius-lg"}>
      <h2 className="text-accent-cooler-600">{Config?.crtkTask?.titleText}</h2>
      <MiniCallout calloutType="informational">
        <div className="text-normal">
          {templateEval(Config.crtkTask.notFoundText, {
            businessName: business?.crtkData?.crtkBusinessDetails?.businessName || "",
          })}
          <UnStyledButton isUnderline className="margin-left-05" onClick={props.onSearchAgain}>
            {Config.crtkTask.changeItLinkText}
          </UnStyledButton>
          <Content>{Config?.crtkTask?.bizNotInDatabaseText}</Content>
        </div>
      </MiniCallout>
      {error && (
        <Alert
          variant={"error"}
          heading={Config.crtkTask.emailErrorAlertHeadingText}
          dataTestid="email-error-alert"
        >
          {Config.crtkTask.emailErrorAlertBodyText}
        </Alert>
      )}
      <div className="margin-top-4">
        <h3>{Config?.crtkTask?.whatToDoNextTitle}</h3>
        <div>{Config?.crtkTask?.whatToDoNextText}</div>
        <div className={"flex fac"}>
          <Checkbox
            id="registered-business-checkbox"
            data-testid="registered-business-checkbox"
            checked={registeredBusiness}
            onChange={(e) => setRegisteredBusiness(e.target.checked)}
            inputProps={{
              "aria-labelledby": "registered-business-label",
            }}
          />

          <label
            id="registered-business-label"
            htmlFor="registered-business-checkbox"
            className="margin-left-1"
          >
            {Config?.crtkTask?.registeredBusinessCheckboxLabel}
          </label>
        </div>
        {registeredBusiness && (
          <ActivitiesForm
            onSearchAgain={props.onSearchAgain}
            setCrtkEmailSent={props.setCrtkEmailSent}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
};
