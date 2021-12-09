export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
  externalStatus: ExternalStatus;
  receiveNewsletter: boolean;
  userTesting: boolean;
  myNJUserKey?: string;
  intercomHash?: string;
};

export type ExternalStatus = {
  newsletter?: NewsletterResponse;
  userTesting?: UserTestingResponse;
};

export interface NewsletterResponse {
  success: boolean;
  status: NewsletterStatus;
}

export interface UserTestingResponse {
  success: boolean;
}

export type NewsletterStatus = typeof newsletterStatusList[number];

export const newsletterStatusList = [
  "SUCCESS",
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_ERROR",
  "RESPONSE_FAIL",
  "RESPONSE_WARNING",
  "QUESTION_WARNING",
] as const;
