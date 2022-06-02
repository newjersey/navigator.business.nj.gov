import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { GenericTextField } from "@/components/GenericTextField";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import UAParser from "ua-parser-js";

const createReportIssueErrorMap = () => ({
  issueSummary: { invalid: false },
  issueDetails: { invalid: false },
});

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestDialogNames) => void;
};

export const ReportIssueDialog = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const MAX_CHARS = 1000;
  const { userData } = useUserData();
  const { Config } = useConfig();
  const router = useRouter();

  const [issueSummary, setIssueSummary] = useState<string>("");
  const [issueDetails, setIssueDetails] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);

  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const [errorMap, setErrorMap] = useState(createReportIssueErrorMap());

  useEffect(() => {
    if (!isOpen) {
      setIssueSummary("");
      setIssueDetails("");
    }
  }, [isOpen]);

  const onValidation = (fieldName: string, invalid: boolean) => {
    setErrorMap({ ...errorMap, [fieldName]: { invalid } });
  };

  const handleReportIssueSubmission = () => {
    if (!userData) return;

    const parsedUserAgent = new UAParser().getResult();
    const operatingSystem = parsedUserAgent.os.name
      ? `${parsedUserAgent.os.name} ${parsedUserAgent.os.version} `
      : "";

    const device = parsedUserAgent.device.vendor
      ? `${parsedUserAgent.device.vendor} ${parsedUserAgent.device.model} ${parsedUserAgent.device.type}`
      : "";

    const issue = {
      context: issueSummary,
      detail: issueDetails,
      pageOfRequest: router.asPath,
      device: `${operatingSystem}${device}`,
      browser: `${parsedUserAgent.browser.name} v.${parsedUserAgent.browser.version}`,
      screenWidth: `${window.innerWidth} px`,
    };

    if (issueSummary.trim().length === 0) {
      onValidation("issueSummary", true);
      return;
    }

    if (issueDetails.trim().length === 0) {
      onValidation("issueDetails", true);
      return;
    }

    if (issueSummary.trim().length > 0 && issueDetails.trim().length > 0) {
      setIsLoading(true);
      api
        .postIssue(issue, userData)
        .then(() => {
          setCurrentFeedback("Request Submitted");
        })
        .catch(() => {
          console.log("catch statement");
          setDisplayAlert(true);
          setIsLoading(false);
        });
    }
  };

  return (
    <>
      <DialogTwoButton
        maxWidth="md"
        isOpen={isOpen}
        close={onClose}
        title={Config.feedbackModal.reportIssueModalHeadingText}
        primaryButtonText={Config.feedbackModal.feedbackSubmitButtonText}
        primaryButtonOnClick={handleReportIssueSubmission}
        secondaryButtonText={Config.feedbackModal.feedbackCancelButtonText}
        showAlert={displayAlert}
        alertText={Config.feedbackModal.unsuccessfulSubmissionAlertText}
        alertVariant={"error"}
        isLoading={isLoading}
      >
        <div className={`text-base ${isTabletAndUp && "width-tablet"}`}>
          <div className="text-base-darkest">
            <Content>{Config.feedbackModal.reportIssueModalSummaryBodyText}</Content>
          </div>
          <div className="margin-top-1">
            <Content>{Config.feedbackModal.reportIssueModalSummaryAdditionalBodyText}</Content>
          </div>
          <div className="margin-bottom-2">
            <GenericTextField
              required
              onValidation={onValidation}
              validationText={Config.feedbackModal.feedbackInlineErrorText}
              error={errorMap.issueSummary.invalid}
              formInputFull
              fieldName="issueSummary"
              placeholder={Config.feedbackModal.feedbackPlaceholderText}
              value={issueSummary}
              handleChange={(value: string) => {
                setIssueSummary(value);
              }}
              fieldOptions={{
                multiline: true,
                maxRows: isTabletAndUp ? 10 : 5,
                minRows: 3,
                className: "override-padding",
                inputProps: {
                  maxLength: MAX_CHARS,
                  sx: {
                    padding: "1rem",
                  },
                },
              }}
            />
          </div>
        </div>

        <div className={`text-base ${isTabletAndUp && "width-tablet"}`}>
          <div className="text-base-darkest">
            <Content>{Config.feedbackModal.reportIssueModalDetailBodyText}</Content>
          </div>
          <div className="margin-top-1">
            <Content>{Config.feedbackModal.reportIssueModalDetailAdditionalBodyText}</Content>
          </div>
          <div className="margin-bottom-2">
            <GenericTextField
              required
              onValidation={onValidation}
              validationText={Config.feedbackModal.feedbackInlineErrorText}
              error={errorMap.issueDetails.invalid}
              formInputFull
              fieldName="issueDetails"
              placeholder={Config.feedbackModal.feedbackPlaceholderText}
              value={issueDetails}
              handleChange={(value: string) => {
                setIssueDetails(value);
              }}
              fieldOptions={{
                multiline: true,
                maxRows: isTabletAndUp ? 10 : 5,
                minRows: 3,
                className: "override-padding",
                inputProps: {
                  maxLength: MAX_CHARS,
                  sx: {
                    padding: "1rem",
                  },
                },
              }}
            />
          </div>
        </div>
      </DialogTwoButton>
    </>
  );
};
