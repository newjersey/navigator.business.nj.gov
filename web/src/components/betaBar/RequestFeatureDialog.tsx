import { Content } from "@/components/Content";
import { DialogTwoButton } from "@/components/DialogTwoButton";
import { GenericTextField } from "@/components/GenericTextField";
import * as api from "@/lib/api-client/apiClient";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useState } from "react";
import UAParser from "ua-parser-js";

const createFeedbackModalErrorMap = () => ({
  featureRequest: { invalid: false },
});

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestDialogNames) => void;
};

export const RequestFeatureDialog = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const MAX_CHARS = 1000;
  const { userData } = useUserData();
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
    setErrorMap({ ...errorMap, [fieldName]: { invalid } });
  };
  const handleFeedbackRequestSubmission = () => {
    if (!userData) return;

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

    if (featureRequest.trim().length === 0) onValidation("featureRequest", true);
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
      <DialogTwoButton
        maxWidth="md"
        isOpen={isOpen}
        close={onClose}
        title={Config.betaBar.featureRequestModalHeadingText}
        primaryButtonText={Config.betaBar.featureRequestModalSubmitButtonText}
        primaryButtonOnClick={handleFeedbackRequestSubmission}
        secondaryButtonText={Config.betaBar.featureRequestModalCancelButtonText}
        showAlert={displayAlert}
        alertText={Config.betaBar.unsuccessfulSubmissionAlertText}
        alertVariant={"error"}
        isLoading={isLoading}
      >
        <div className="text-base">
          <div className="text-base-darkest">
            <Content>{Config.betaBar.featureRequestModalBodyText}</Content>
          </div>
          <div className="margin-top-1">
            <Content>{Config.betaBar.featureRequestModalSecondBodyText}</Content>
          </div>
          <div className={`${isTabletAndUp && "width-tablet"} margin-bottom-3`}>
            <GenericTextField
              required
              onValidation={onValidation}
              validationText={Config.betaBar.featureRequestModalInlineErrorText}
              error={errorMap.featureRequest.invalid}
              formInputFull
              fieldName="featureRequest"
              placeholder={Config.betaBar.featureRequestModalPlaceholderText}
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
