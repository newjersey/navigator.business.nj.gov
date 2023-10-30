import { NewsletterClient } from "@domain/types";
import { LogWriterType } from "@libs/logWriter";
import { NewsletterResponse, NewsletterStatus } from "@shared/businessUser";
import axios, { AxiosError } from "axios";

type GovDeliveryNewsletterClientConfig = {
  baseUrl: string;
  topic: string;
  apiKey: string;
  logWriter: LogWriterType;
  siteUrl?: string;
  urlQuestion?: string;
};

export type GovDeliveryResponse = {
  citizen_id?: number;
  topic_id?: string;
  message?: string;
  errors?: { email?: string[]; secondary_email?: string[]; wireless?: string[] };
};

export const GovDeliveryNewsletterClient = (config: GovDeliveryNewsletterClientConfig): NewsletterClient => {
  const logId = config.logWriter.GetId();
  const add = (email: string): Promise<NewsletterResponse> => {
    const url = `${config.baseUrl}/api/add_script_subscription`;
    config.logWriter.LogInfo(
      `NewsletterResponse - GovDelivery - Id:${logId} - Request Sent. url: ${url}. email: ${email}`
    );
    return axios
      .get(url, {
        params: {
          e: email,
          t: config.topic,
          k: config.apiKey,
          ...(config.urlQuestion ? { [config.urlQuestion]: config.siteUrl } : {}),
        },
      })
      .then((response) => {
        config.logWriter.LogInfo(
          `NewsletterResponse - GovDelivery - - Id:${logId} Response Received. Status: ${response.status} : ${
            response.statusText
          }. Data: ${JSON.stringify(response.data)}`
        );
        let status: NewsletterStatus;
        const data: GovDeliveryResponse =
          typeof response.data === "string" &&
          response.data.trim().charAt(0) === "(" &&
          response.data.trim().charAt(response.data.trim().length - 1) === ")"
            ? JSON.parse(response.data.trim().slice(1, response.data.trim().length - 1))
            : response.data;

        const success = !!(
          !!data.citizen_id &&
          !!data.topic_id &&
          !!data.message &&
          data.message.includes("created")
        );

        if (success) {
          if (data.errors?.email?.join("").includes("Unable update responses")) {
            status = "QUESTION_WARNING";
          } else if (data.errors?.email?.length) {
            status = "RESPONSE_WARNING";
          } else {
            status = "SUCCESS";
          }
        } else {
          if (data.errors?.email?.join("").includes("Email is invalid")) {
            status = "EMAIL_ERROR";
          } else if (data.errors?.email?.join("").includes("Unable to subscribe")) {
            status = "TOPIC_ERROR";
          } else {
            status = "RESPONSE_ERROR";
          }
        }
        return {
          success,
          status,
        };
      })
      .catch((error: AxiosError) => {
        config.logWriter.LogError(`NewsletterResponse - GovDelivery - Id:${logId} - Error`, error);
        return {
          success: false,
          status: "CONNECTION_ERROR",
        };
      });
  };
  return {
    add,
  };
};
