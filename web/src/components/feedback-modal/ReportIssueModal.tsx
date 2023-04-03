import { Content } from "@/components/Content";
import { GenericTextField } from "@/components/GenericTextField";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { Alert } from "@/components/njwds-extended/Alert";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { FeedbackRequestModalNames } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useState } from "react";
import UAParser from "ua-parser-js";

const createReportIssueErrorMap = (): {
  issueSummary: { invalid: boolean };
  issueDetails: { invalid: boolean };
} => {
  return {
    issueSummary: { invalid: false },
    issueDetails: { invalid: false },
  };
};

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestModalNames) => void;
};

export const ReportIssueModal = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
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

  const onValidation = (fieldName: string, invalid: boolean): void => {
    setErrorMap((errorMap) => {
      return { ...errorMap, [fieldName]: { invalid } };
    });
  };

  const handleReportIssueSubmission = (): void => {
    if (!userData) {
      return;
    }

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
    }

    if (issueDetails.trim().length === 0) {
      onValidation("issueDetails", true);
    }

    if (issueSummary.trim().length > 0 && issueDetails.trim().length > 0) {
      setIsLoading(true);
      api
        .postIssue(issue, userData)
        .then(() => {
          setCurrentFeedback("Request Submitted");
        })
        .catch(() => {
          setDisplayAlert(true);
          setIsLoading(false);
        });
    }
  };

  return (
    <>
      <ModalTwoButton
        maxWidth="md"
        isOpen={isOpen}
        close={onClose}
        title={Config.feedbackModal.reportIssueModalHeadingText}
        primaryButtonText={Config.feedbackModal.feedbackSubmitButtonText}
        primaryButtonOnClick={handleReportIssueSubmission}
        secondaryButtonText={Config.feedbackModal.feedbackCancelButtonText}
        isLoading={isLoading}
      >
        <div className={`${isTabletAndUp && "width-tablet"}`}>
          {displayAlert && (
            <Alert dataTestid="modal-alert" variant="error">
              <Content>{Config.feedbackModal.unsuccessfulSubmissionAlertText}</Content>
            </Alert>
          )}
          <Content>{Config.feedbackModal.reportIssueModalSummaryBodyText}</Content>
          <Content className="margin-top-1 text-base">
            {Config.feedbackModal.reportIssueModalSummaryAdditionalBodyText}
          </Content>
          <GenericTextField
            required
            onValidation={onValidation}
            validationText={Config.feedbackModal.feedbackInlineErrorText}
            error={errorMap.issueSummary.invalid}
            formInputFull
            fieldName="issueSummary"
            value={issueSummary}
            handleChange={(value: string): void => {
              setIssueSummary(value);
            }}
            fieldOptions={{
              multiline: true,
              maxRows: isTabletAndUp ? 10 : 5,
              minRows: 3,
              className: "override-padding",
              inputProps: {
                maxLength: MAX_CHARS,
                sx: { padding: "1rem" },
              },
            }}
          />

          <Content>{Config.feedbackModal.reportIssueModalDetailBodyText}</Content>
          <Content className="margin-top-1 text-base">
            {Config.feedbackModal.reportIssueModalDetailAdditionalBodyText}
          </Content>
          <GenericTextField
            required
            onValidation={onValidation}
            validationText={Config.feedbackModal.feedbackInlineErrorText}
            error={errorMap.issueDetails.invalid}
            formInputFull
            fieldName="issueDetails"
            value={issueDetails}
            handleChange={(value: string): void => {
              setIssueDetails(value);
            }}
            fieldOptions={{
              multiline: true,
              maxRows: isTabletAndUp ? 10 : 5,
              minRows: 3,
              className: "override-padding",
              inputProps: {
                maxLength: MAX_CHARS,
                sx: { padding: "1rem" },
              },
            }}
          />
        </div>
      </ModalTwoButton>
    </>
  );
};
