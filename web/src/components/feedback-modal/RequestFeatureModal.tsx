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

const createFeedbackModalErrorMap = () => {
  return {
    featureRequest: { invalid: false },
  };
};

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestModalNames) => void;
};

export const RequestFeatureModal = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const MAX_CHARS = 1000;
  const { userData } = useUserData();
  const { Config } = useConfig();
  const [displayAlert, setDisplayAlert] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [featureRequest, setFeatureRequest] = useState<string>("");
  const isTabletAndUp = useMediaQuery(MediaQueries.tabletAndUp);
  const [errorMap, setErrorMap] = useState(createFeedbackModalErrorMap());
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setFeatureRequest("");
    }
  }, [isOpen]);

  const onValidation = (fieldName: string, invalid: boolean) => {
    setErrorMap((prevErrorMap) => {
      return { ...prevErrorMap, [fieldName]: { invalid } };
    });
  };
  const handleFeedbackRequestSubmission = () => {
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

    const feedback = {
      detail: featureRequest,
      pageOfRequest: router.asPath,
      device: `${operatingSystem}${device}`,
      browser: `${parsedUserAgent.browser.name} v.${parsedUserAgent.browser.version}`,
      screenWidth: `${window.innerWidth} px`,
    };

    if (featureRequest.trim().length === 0) {
      onValidation("featureRequest", true);
    }
    if (featureRequest.trim().length > 0) {
      setIsLoading(true);
      api
        .postFeedback(feedback, userData)
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
        title={Config.feedbackModal.featureRequestModalHeadingText}
        primaryButtonText={Config.feedbackModal.feedbackSubmitButtonText}
        primaryButtonOnClick={handleFeedbackRequestSubmission}
        secondaryButtonText={Config.feedbackModal.feedbackCancelButtonText}
        isLoading={isLoading}
      >
        <div className={`${isTabletAndUp && "width-tablet"}`}>
          {displayAlert && (
            <Alert dataTestid="modal-alert" variant="error">
              <Content>{Config.feedbackModal.unsuccessfulSubmissionAlertText}</Content>
            </Alert>
          )}
          <Content>{Config.feedbackModal.featureRequestModalBodyText}</Content>
          <Content className="margin-top-1 text-base">
            {Config.feedbackModal.featureRequestModalSecondBodyText}
          </Content>
          <GenericTextField
            required
            onValidation={onValidation}
            validationText={Config.feedbackModal.feedbackInlineErrorText}
            error={errorMap.featureRequest.invalid}
            formInputFull
            fieldName="featureRequest"
            value={featureRequest}
            handleChange={(value: string) => {
              setFeatureRequest(value);
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
