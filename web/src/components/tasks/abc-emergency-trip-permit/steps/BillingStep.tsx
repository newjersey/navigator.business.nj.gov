import { Heading } from "@/components/njwds-extended/Heading";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitCountryDropdown";
import { EmergencyTripPermitStateDropdown } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitStateDropdown";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/EmergencyTripPermitTextField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { templateEval } from "@/lib/utils/helpers";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

export const BillingStep = (): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const [additionalEmailDownloadLink, setAdditionalEmailDownloadLink] = useState(false);

  return (
    <form className={`usa-prose onboarding-form margin-top-2`}>
      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.billing.servicesSection}</Heading>
      </div>

      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.billing.billingSection}</Heading>
        <EmergencyTripPermitTextFieldEntry fieldName={"payerCompanyName"} required />
        <div className={"grid-row grid-gap"}>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerFirstName"} maxLength={35} required />
          </span>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerLastName"} maxLength={35} required />
          </span>
        </div>
        <EmergencyTripPermitTextFieldEntry fieldName={"payerEmail"} required />
        <EmergencyTripPermitTextFieldEntry fieldName={"payerPhoneNumber"} maxLength={15} required />
        <EmergencyTripPermitCountryDropdown fieldName={"payerCountry"} />
        <EmergencyTripPermitTextFieldEntry fieldName={"payerAddress1"} maxLength={35} required />
        <EmergencyTripPermitTextFieldEntry
          fieldName={"payerAddress2"}
          secondaryLabel={"(Optional)"}
          required={false}
          maxLength={35}
        />
        <div className={"grid-row grid-gap"}>
          <span className={"grid-col-6"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerCity"} maxLength={35} required />
          </span>
          <EmergencyTripPermitStateDropdown fieldName={"payerStateAbbreviation"} />
          <span className={"grid-col-4"}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerZipCode"} maxLength={10} required />
          </span>
        </div>
      </div>

      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.billing.permitSection}</Heading>
        {templateEval(Config.abcEmergencyTripPermit.steps.billing.permitSubheader, {
          requestorEmail: context.state.applicationInfo.requestorEmail,
        })}
        <div>
          <FormGroup>
            <FormControlLabel
              label={Config.abcEmergencyTripPermit.steps.billing.pdfAttachCheckboxLabel}
              control={
                <Checkbox
                  checked={context.state.applicationInfo.pdfAttach === "1"}
                  onChange={(event): void =>
                    context.setApplicationInfo({
                      ...context.state.applicationInfo,
                      pdfAttach: event.target.checked ? "1" : "0",
                    })
                  }
                  id="pdfAttachCheckbox"
                />
              }
            />
            <FormControlLabel
              label={Config.abcEmergencyTripPermit.steps.billing.textMessageDownloadLinkCheckboxLabel}
              control={
                <Checkbox
                  checked={context.state.applicationInfo.textMsg === "1"}
                  onChange={(event): void =>
                    context.setApplicationInfo({
                      ...context.state.applicationInfo,
                      textMsg: event.target.checked ? "1" : "0",
                    })
                  }
                  id="textMessageDownloadLinkCheckbox"
                />
              }
            />
            {context.state.applicationInfo.textMsg === "1" && (
              <EmergencyTripPermitTextFieldEntry fieldName={"textMsgMobile"} required maxLength={15} />
            )}
            <FormControlLabel
              label={Config.abcEmergencyTripPermit.steps.billing.additionalEmailDownloadLinkCheckboxLabel}
              control={
                <Checkbox
                  checked={additionalEmailDownloadLink}
                  onChange={(event): void => setAdditionalEmailDownloadLink(event.target.checked)}
                  id="textMessageDownloadLinkCheckbox"
                />
              }
            />
            {additionalEmailDownloadLink && (
              <EmergencyTripPermitTextFieldEntry fieldName={"additionalEmail"} required maxLength={60} />
            )}
          </FormGroup>
        </div>
      </div>
    </form>
  );
};
