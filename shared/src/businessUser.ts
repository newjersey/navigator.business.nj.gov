import { v4 as uuidv4 } from "uuid";

export const registrationStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "RESPONSE_ERROR",
  "DUPLICATE_ERROR",
] as const;
export type RegistrationStatus = (typeof registrationStatusList)[number];

export type BusinessUser = {
  readonly name?: string;
  readonly email: string;
  readonly id: string;
  readonly externalStatus: ExternalStatus;
  readonly receiveNewsletter: boolean;
  readonly userTesting: boolean;
  readonly receiveUpdatesAndReminders: boolean;
  readonly accountCreationSource: string;
  readonly contactSharingWithAccountCreationPartner: boolean;
  readonly phoneNumber?: string;
  readonly myNJUserKey?: string;
  readonly intercomHash?: string;
  readonly onboardedAsLearningUser?: boolean;
};

export const emptyBusinessUser: BusinessUser = {
  name: undefined,
  email: "",
  id: uuidv4(),
  externalStatus: {},
  receiveNewsletter: true,
  userTesting: true,
  receiveUpdatesAndReminders: true,
  accountCreationSource: "",
  contactSharingWithAccountCreationPartner: true,
  phoneNumber: undefined,
  myNJUserKey: undefined,
  intercomHash: undefined,
  onboardedAsLearningUser: undefined,
};

export const createEmptyUser = (overrides?: Partial<BusinessUser>): BusinessUser => {
  return {
    ...emptyBusinessUser,
    ...overrides,
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

export type NewsletterStatus = (typeof newsletterStatusList)[number];

export const externalStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "RESPONSE_ERROR",
  "CONNECTION_ERROR",
] as const;

export const userTestingStatusList = [...externalStatusList] as const;

export type UserTestingStatus = (typeof userTestingStatusList)[number];

export const newsletterStatusList = [
  ...externalStatusList,
  "EMAIL_ERROR",
  "TOPIC_ERROR",
  "RESPONSE_FAIL",
  "RESPONSE_WARNING",
  "QUESTION_WARNING",
] as const;
