import { EmailMetaData, EnvironmentPermitEmailClient } from "@businessnjgovnavigator/shared";
import { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import axios from "axios";

const getConfig = async (): Promise<{
  emailConfirmationUrl: string;
  emailConfirmationKey: string;
}> => {
  return {
    emailConfirmationUrl: await getConfigValue("env_req_email_confirmation_url"),
    emailConfirmationKey: await getConfigValue("env_req_email_confirmation_key"),
  };
};

export const ApiEnvPermitEmailClient = (logWriter: LogWriterType): EnvironmentPermitEmailClient => {
  const sendEmail = async (emailMetaData: EmailMetaData): Promise<string> => {
    const Config = await getConfig();
    return await axios
      .post(Config.emailConfirmationUrl, emailMetaData, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": Config.emailConfirmationKey,
        },
      })
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
