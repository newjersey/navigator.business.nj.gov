import { GovDeliveryCommCloudClientType } from "@domain/newsletter/syncNewsletterSubscription";
import { IS_DOCKER, STAGE } from "@functions/config";
import { getConfigValue } from "@libs/ssmUtils";
import { NewsletterResponse } from "@shared/businessUser";
import axios from "axios";

type GovDeliveryCommCloudClientConfig = {
  baseUrl: string;
  accountCode: string;
  username: string;
  password: string;
  topicCode: string;
};

const getConfig = async (): Promise<GovDeliveryCommCloudClientConfig> => {
  const baseUrl =
    STAGE === "local"
      ? `http://${IS_DOCKER ? "wiremock" : "localhost"}:9000`
      : await getConfigValue("gov_delivery_base_url");
  return {
    baseUrl,
    accountCode: await getConfigValue("gov_delivery_comm_cloud_account_code"),
    username: await getConfigValue("gov_delivery_comm_cloud_username"),
    password: await getConfigValue("gov_delivery_comm_cloud_password"),
    topicCode: await getConfigValue("gov_delivery_topic"),
  };
};

const escapeXml = (s: string): string =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

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

export const GovDeliveryCommCloudClient = (): GovDeliveryCommCloudClientType => {
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const subscribe = async (email: string): Promise<NewsletterResponse> => {
    const config = await getConfig();
    const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    try {
      const response = await axios.post(url, buildSubscriptionXml(email, config.topicCode), {
        headers: { Authorization: authHeader, "Content-Type": "application/xml" },
      });
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch {
      return toConnectionError();
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const unsubscribe = async (email: string): Promise<NewsletterResponse> => {
    const config = await getConfig();
    const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    try {
      const response = await axios.delete(url, {
        data: buildSubscriptionXml(email, config.topicCode),
        headers: { Authorization: authHeader, "Content-Type": "application/xml" },
      });
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch {
      return toConnectionError();
    }
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const updateEmail = async (oldEmail: string, newEmail: string): Promise<NewsletterResponse> => {
    const config = await getConfig();
    const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
    const encodedEmail = Buffer.from(oldEmail.toLowerCase()).toString("base64");
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscribers/${encodedEmail}.xml`;
    try {
      const response = await axios.put(url, buildUpdateEmailXml(newEmail), {
        headers: { Authorization: authHeader, "Content-Type": "application/xml" },
      });
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch {
      return toConnectionError();
    }
  };

  return { subscribe, unsubscribe, updateEmail };
};
