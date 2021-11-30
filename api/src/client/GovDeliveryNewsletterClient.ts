import { NewsletterResponse, NewsletterClient, NewsletterStatus } from "../domain/types";
import axios, { AxiosError } from "axios";
import { LogWriterType } from "../libs/logWriter";

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
  const add = (email: string): Promise<NewsletterResponse> => {
    const url = `${config.baseUrl}/api/add_script_subscription`;
    config.logWriter.LogInfo(`NewsletterResponse - GovDelivery - Request Sent. url: ${url}. email: ${email}`);
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
          `NewsletterResponse - GovDelivery - Response Received. Status: ${response.status} : ${response.statusText}. Data: ${response.data}`
        );
        let data: GovDeliveryResponse;
        let status: NewsletterStatus;
        if (
          typeof response.data === "string" &&
          response.data.trim().charAt(0) === "(" &&
          response.data.trim().charAt(response.data.trim().length - 1) === ")"
        ) {
          data = JSON.parse(response.data.trim().substring(1, response.data.trim().length - 1));
        } else {
          data = response.data;
        }

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
        config.logWriter.LogError("NewsletterResponse - GovDelivery - Error", error);
        return {
          success: false,
          status: "RESPONSE_FAIL",
        };
      });
  };
  return {
    add,
  };
};
