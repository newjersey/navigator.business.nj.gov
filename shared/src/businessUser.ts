import { v4 as uuidv4 } from "uuid";

export const registrationStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "RESPONSE_ERROR",
  "DUPLICATE_ERROR",
] as const;
export type RegistrationStatus = typeof registrationStatusList[number];

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

export const emptyBusinessUser = {
  name: undefined,
  email: "",
  id: uuidv4(),
  externalStatus: {},
  receiveNewsletter: true,
  userTesting: true,
  myNJUserKey: undefined,
  intercomHash: undefined,
};

export const createEmptyUser = (): BusinessUser => emptyBusinessUser;

export type ExternalStatus = {
  newsletter?: NewsletterResponse;
  userTesting?: UserTestingResponse;
};

export interface NewsletterResponse {
  success?: boolean;
  status: NewsletterStatus;
}

export interface UserTestingResponse {
  success?: boolean;
  status: UserTestingStatus;
}

export type NewsletterStatus = typeof newsletterStatusList[number];

export const externalStatusList = ["SUCCESS", "IN_PROGRESS", "RESPONSE_ERROR", "CONNECTION_ERROR"] as const;

export const userTestingStatusList = [...externalStatusList] as const;

export type UserTestingStatus = typeof userTestingStatusList[number];

export const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_FAIL",
  "RESPONSE_WARNING",
  "QUESTION_WARNING",
] as const;
