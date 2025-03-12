import { Heading } from "@/components/njwds-extended/Heading";
import { EmergencyTripPermitCountryDropdown } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitCountryDropdown";
import { EmergencyTripPermitPaymentTable } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitPaymentTable";
import { EmergencyTripPermitStateDropdown } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitStateDropdown";
import { EmergencyTripPermitTextFieldEntry } from "@/components/tasks/abc-emergency-trip-permit/fields/EmergencyTripPermitTextField";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { MediaQueries } from "@/lib/PageSizes";
import { templateEval } from "@/lib/utils/helpers";
import { Checkbox, FormControlLabel, FormGroup, useMediaQuery } from "@mui/material";
import { ReactElement, useContext, useState } from "react";

export const BillingStep = (): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const [showAdditionalEmailDownloadLink, setShowAdditionalEmailDownloadLink] = useState(
    context.state.applicationInfo.additionalEmail !== ""
  );
  const isMobile = useMediaQuery(MediaQueries.isMobile);

  return (
    <form className={`usa-prose onboarding-form margin-top-2`}>
      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.billing.servicesSection}</Heading>
        <EmergencyTripPermitPaymentTable />
      </div>

      <div className={"padding-top-1 padding-bottom-3"}>
        <Heading level={3}>{Config.abcEmergencyTripPermit.steps.billing.billingSection}</Heading>
        <EmergencyTripPermitTextFieldEntry fieldName={"payerCompanyName"} required />
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerFirstName"} required />
          </span>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerLastName"} required />
          </span>
        </div>
        <EmergencyTripPermitTextFieldEntry fieldName={"payerEmail"} required />
        <EmergencyTripPermitTextFieldEntry fieldName={"payerPhoneNumber"} required />
        <EmergencyTripPermitCountryDropdown fieldName={"payerCountry"} />
        <EmergencyTripPermitTextFieldEntry fieldName={"payerAddress1"} required />
        <EmergencyTripPermitTextFieldEntry
          fieldName={"payerAddress2"}
          secondaryLabel={"(Optional)"}
          required={false}
        />
        <div className={"grid-row grid-gap"}>
          <span className={`${isMobile ? "width-100" : "grid-col-6"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerCity"} required />
          </span>
          <EmergencyTripPermitStateDropdown
            className={isMobile ? "grid-col-6" : ""}
            fieldName={"payerStateAbbreviation"}
          />
          <span className={`${isMobile ? "grid-col-6" : "grid-col-4"}`}>
            <EmergencyTripPermitTextFieldEntry fieldName={"payerZipCode"} required />
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
                  checked={context.state.applicationInfo.shouldAttachPdfToEmail}
                  onChange={(event): void =>
                    context.setApplicationInfo({
                      ...context.state.applicationInfo,
                      shouldAttachPdfToEmail: event.target.checked,
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
                  checked={context.state.applicationInfo.shouldSendTextConfirmation}
                  onChange={(event): void =>
                    context.setApplicationInfo({
                      ...context.state.applicationInfo,
                      shouldSendTextConfirmation: event.target.checked,
                    })
                  }
                  id="textMessageDownloadLinkCheckbox"
                />
              }
            />
            {context.state.applicationInfo.shouldSendTextConfirmation && (
              <EmergencyTripPermitTextFieldEntry fieldName={"textMsgMobile"} required />
            )}
            <FormControlLabel
              label={Config.abcEmergencyTripPermit.steps.billing.additionalEmailDownloadLinkCheckboxLabel}
              control={
                <Checkbox
                  checked={showAdditionalEmailDownloadLink}
                  onChange={(event): void => setShowAdditionalEmailDownloadLink(event.target.checked)}
                  id="textMessageDownloadLinkCheckbox"
                />
              }
            />
            {showAdditionalEmailDownloadLink && (
              <EmergencyTripPermitTextFieldEntry fieldName={"additionalEmail"} required />
            )}
          </FormGroup>
        </div>
      </div>
    </form>
  );
};
