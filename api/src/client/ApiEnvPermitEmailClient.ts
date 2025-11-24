import { EmailMetaData, EnvironmentPermitEmailClient } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import axios from "axios";

const getConfig = async (
  logWriter: LogWriterType,
): Promise<{
  emailConfirmationUrl: string;
  emailConfirmationKey: string;
}> => {
  return {
    emailConfirmationUrl: await getConfigValue("env_req_email_confirmation_url", logWriter),
    emailConfirmationKey: await getConfigValue("env_req_email_confirmation_key", logWriter),
  };
};

export const ApiEnvPermitEmailClient = (logWriter: LogWriterType): EnvironmentPermitEmailClient => {
  const sendEmail = async (emailMetaData: EmailMetaData): Promise<string> => {
    const config = await getConfig(logWriter);
    return await axios
      .post(
        config.emailConfirmationUrl,
        { ...emailMetaData, "api-key": config.emailConfirmationKey },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        logWriter.LogInfo(
          `Email sent successfully for: ${emailMetaData.userName}, ${emailMetaData.businessName}`,
        );
        return response.data;
      })
      .catch((error) => {
        logWriter.LogError(`Failed to send email: ${error.message}`);
        return error.message;
      });
  };
  return { sendEmail };
};
