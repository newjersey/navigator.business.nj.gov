import { GovDeliveryCommCloudClientType } from "@domain/newsletter/syncNewsletterSubscription";
import { NewsletterResponse } from "@shared/businessUser";
import axios from "axios";

type GovDeliveryCommCloudClientConfig = {
  baseUrl: string;
  accountCode: string;
  username: string;
  password: string;
  topicCode: string;
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

const isHttpError = (error: unknown): boolean =>
  typeof error === "object" && error !== null && "response" in error;

export const GovDeliveryCommCloudClient = (
  config: GovDeliveryCommCloudClientConfig,
): GovDeliveryCommCloudClientType => {
  const authHeader = `Basic ${Buffer.from(`${config.username}:${config.password}`).toString("base64")}`;
  const xmlHeaders = {
    Authorization: authHeader,
    "Content-Type": "application/xml",
  };

  const subscribe = async (email: string): Promise<NewsletterResponse> => {
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    try {
      await axios.post(url, buildSubscriptionXml(email, config.topicCode), {
        headers: xmlHeaders,
      });
      return toSuccess();
    } catch (error) {
      return isHttpError(error) ? toResponseError() : toConnectionError();
    }
  };

  const unsubscribe = async (email: string): Promise<NewsletterResponse> => {
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    try {
      await axios.delete(url, {
        data: buildSubscriptionXml(email, config.topicCode),
        headers: xmlHeaders,
      });
      return toSuccess();
    } catch (error) {
      return isHttpError(error) ? toResponseError() : toConnectionError();
    }
  };

  const updateEmail = async (oldEmail: string, newEmail: string): Promise<NewsletterResponse> => {
    const encodedEmail = Buffer.from(oldEmail.toLowerCase()).toString("base64");
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscribers/${encodedEmail}.xml`;
    try {
      await axios.put(url, buildUpdateEmailXml(newEmail), {
        headers: xmlHeaders,
      });
      return toSuccess();
    } catch (error) {
      return isHttpError(error) ? toResponseError() : toConnectionError();
    }
  };

  return { subscribe, unsubscribe, updateEmail };
};
