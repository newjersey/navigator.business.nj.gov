import { GovDeliveryCommCloudClientType } from "@domain/newsletter/syncNewsletterSubscription";
import { IS_DOCKER, STAGE } from "@functions/config";
import type { LogWriterType } from "@libs/logWriter";
import { getConfigValue } from "@libs/ssmUtils";
import { NewsletterResponse } from "@shared/businessUser";
import axios, { AxiosError } from "axios";

type GovDeliveryCommCloudClientConfig = {
  baseUrl: string;
  accountCode: string;
  username: string;
  password: string;
  topicCode: string;
  useStub: boolean;
};

const getConfig = async (): Promise<GovDeliveryCommCloudClientConfig> => {
  const password = await getConfigValue("gov_delivery_comm_cloud_password");
  const useWiremock = STAGE === "local" && !password;
  const baseUrl = useWiremock
    ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
    : await getConfigValue("gov_delivery_base_url");
  return {
    baseUrl,
    accountCode: await getConfigValue("gov_delivery_comm_cloud_account_code"),
    username: await getConfigValue("gov_delivery_comm_cloud_username"),
    password,
    topicCode: await getConfigValue("gov_delivery_topic"),
    useStub: !password && STAGE !== "local",
  };
};

const escapeXml = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const buildCreateSubscriberXml = (email: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<subscriber>
  <email>${escapeXml(email)}</email>
  <send-notifications type="boolean">false</send-notifications>
</subscriber>`;

const buildSubscriptionXml = (email: string, topicCode: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<subscriber>
  <email>${escapeXml(email)}</email>
  <send-notifications type="boolean">false</send-notifications>
  <topics type="array">
    <topic>
      <code>${topicCode}</code>
    </topic>
  </topics>
</subscriber>`;

const buildUpdateEmailXml = (newEmail: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<subscriber>
  <email>${escapeXml(newEmail)}</email>
</subscriber>`;

const toSuccess = (): NewsletterResponse => ({ success: true, status: "SUCCESS" });
const toConnectionError = (): NewsletterResponse => ({
  success: false,
  status: "CONNECTION_ERROR",
});
const toResponseError = (): NewsletterResponse => ({ success: false, status: "RESPONSE_ERROR" });

const isSuccess = (status: number): boolean => status >= 200 && status < 300;

const logError = (logger: LogWriterType, logId: string, method: string, error: unknown): void => {
  if (error instanceof AxiosError && error.response) {
    logger.LogError(
      `GovDelivery CommCloud - ${method} - Id:${logId} - HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`,
    );
  } else {
    logger.LogError(`GovDelivery CommCloud - ${method} - Id:${logId} - ${JSON.stringify(error)}`);
  }
};

export const GovDeliveryCommCloudClient = (
  logger: LogWriterType,
): GovDeliveryCommCloudClientType => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const subscribe = async (email: string): Promise<NewsletterResponse> => {
    const config = await getConfig();
    if (config.useStub) return toSuccess();
    const logId = logger.GetId();
    const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    const headers = { Authorization: authHeader, "Content-Type": "application/xml" };

    const createSubscriberUrl = `${config.baseUrl}/api/account/${config.accountCode}/subscribers.xml`;
    logger.LogInfo(`GovDelivery CommCloud - subscribe - Id:${logId} - POST ${createSubscriberUrl}`);
    try {
      const createResponse = await axios.post(
        createSubscriberUrl,
        buildCreateSubscriberXml(email),
        { headers },
      );
      logger.LogInfo(
        `GovDelivery CommCloud - subscribe - Id:${logId} - create-subscriber response: ${createResponse.status}`,
      );
    } catch (error) {
      logError(logger, logId, "subscribe (create-subscriber)", error);
    }

    const addSubscriptionUrl = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    logger.LogInfo(`GovDelivery CommCloud - subscribe - Id:${logId} - POST ${addSubscriptionUrl}`);
    try {
      const subscriptionResponse = await axios.post(
        addSubscriptionUrl,
        buildSubscriptionXml(email, config.topicCode),
        { headers },
      );
      logger.LogInfo(
        `GovDelivery CommCloud - subscribe - Id:${logId} - add-subscription response: ${subscriptionResponse.status}`,
      );
      return isSuccess(subscriptionResponse.status) ? toSuccess() : toResponseError();
    } catch (error) {
      logError(logger, logId, "subscribe (add-subscription)", error);
      return toConnectionError();
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const unsubscribe = async (email: string): Promise<NewsletterResponse> => {
    const config = await getConfig();
    if (config.useStub) return toSuccess();
    const logId = logger.GetId();
    const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    logger.LogInfo(`GovDelivery CommCloud - unsubscribe - Id:${logId} - DELETE ${url}`);

    try {
      const response = await axios.delete(url, {
        data: buildSubscriptionXml(email, config.topicCode),
        headers: { Authorization: authHeader, "Content-Type": "application/xml" },
      });
      logger.LogInfo(
        `GovDelivery CommCloud - unsubscribe - Id:${logId} - Response: ${response.status}`,
      );
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        logger.LogInfo(
          `GovDelivery CommCloud - unsubscribe - Id:${logId} - Subscriber not found, treating as success`,
        );
        return toSuccess();
      }
      logError(logger, logId, "unsubscribe", error);
      return toConnectionError();
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const updateEmail = async (oldEmail: string, newEmail: string): Promise<NewsletterResponse> => {
    const config = await getConfig();
    if (config.useStub) return toSuccess();
    const logId = logger.GetId();
    const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    const encodedEmail = Buffer.from(oldEmail.toLowerCase()).toString("base64");
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscribers/${encodedEmail}.xml`;
    logger.LogInfo(`GovDelivery CommCloud - updateEmail - Id:${logId} - PUT ${url}`);
    try {
      const response = await axios.put(url, buildUpdateEmailXml(newEmail), {
        headers: { Authorization: authHeader, "Content-Type": "application/xml" },
      });
      logger.LogInfo(
        `GovDelivery CommCloud - updateEmail - Id:${logId} - Response: ${response.status}`,
      );
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch (error) {
      logError(logger, logId, "updateEmail", error);
      return toConnectionError();
    }
  };

  return { subscribe, unsubscribe, updateEmail };
};
