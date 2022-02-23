import { v4 as uuidv4 } from "uuid";

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

export const shouldAddToNewsletter = (newBusinessUser: BusinessUser): boolean =>
  newBusinessUser.receiveNewsletter && !newBusinessUser.externalStatus.newsletter;

export const shouldAddToUserTesting = (newBusinessUser: BusinessUser): boolean =>
  newBusinessUser.userTesting && !newBusinessUser.externalStatus.userTesting;

export const externalSyncUser = (newBusinessUser: BusinessUser): BusinessUser => {
  const newsletter = shouldAddToNewsletter(newBusinessUser)
    ? ({ status: "IN_PROGRESS" } as NewsletterResponse)
    : newBusinessUser.externalStatus.newsletter;
  const userTesting = shouldAddToUserTesting(newBusinessUser)
    ? ({ status: "IN_PROGRESS" } as UserTestingResponse)
    : newBusinessUser.externalStatus.userTesting;
  return {
    ...newBusinessUser,
    externalStatus: { ...newBusinessUser.externalStatus, newsletter, userTesting },
  };
};

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
