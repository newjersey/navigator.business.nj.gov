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

const buildSubscriptionXml = (email: string, topicCode: string): string =>
  `<?xml version="1.0" encoding="UTF-8"?>
<subscriber>
  <email>${email}</email>
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
  <email>${newEmail}</email>
</subscriber>`;

const toSuccess = (): NewsletterResponse => ({ success: true, status: "SUCCESS" });
const toConnectionError = (): NewsletterResponse => ({
  success: false,
  status: "CONNECTION_ERROR",
});
const toResponseError = (): NewsletterResponse => ({ success: false, status: "RESPONSE_ERROR" });

const isSuccess = (status: number): boolean => status >= 200 && status < 300;

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
      const response = await axios.post(url, buildSubscriptionXml(email, config.topicCode), {
        headers: xmlHeaders,
      });
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch {
      return toConnectionError();
    }
  };

  const unsubscribe = async (email: string): Promise<NewsletterResponse> => {
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscriptions.xml`;
    try {
      const response = await axios.delete(url, {
        data: buildSubscriptionXml(email, config.topicCode),
        headers: xmlHeaders,
      });
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch {
      return toConnectionError();
    }
  };

  const updateEmail = async (oldEmail: string, newEmail: string): Promise<NewsletterResponse> => {
    const encodedEmail = Buffer.from(oldEmail.toLowerCase()).toString("base64");
    const url = `${config.baseUrl}/api/account/${config.accountCode}/subscribers/${encodedEmail}.xml`;
    try {
      const response = await axios.put(url, buildUpdateEmailXml(newEmail), {
        headers: xmlHeaders,
      });
      return isSuccess(response.status) ? toSuccess() : toResponseError();
    } catch {
      return toConnectionError();
    }
  };

  return { subscribe, unsubscribe, updateEmail };
};
