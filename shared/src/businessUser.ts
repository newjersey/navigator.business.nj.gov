import { v4 as uuidv4 } from "uuid";

export const registrationStatusList = [
  "SUCCESS",
  "IN_PROGRESS",
  "RESPONSE_ERROR",
  "DUPLICATE_ERROR",
] as const;
export type RegistrationStatus = typeof registrationStatusList[number];

export type ABExperience = "ExperienceA" | "ExperienceB";

export type BusinessUser = {
  readonly name?: string;
  readonly email: string;
  readonly id: string;
  readonly externalStatus: ExternalStatus;
  readonly receiveNewsletter: boolean;
  readonly userTesting: boolean;
  readonly myNJUserKey?: string;
  readonly intercomHash?: string;
  readonly abExperience: ABExperience;
};

export const decideABExperience = (): ABExperience => {
  const percent = process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE ?? 0;
  return Math.floor(Math.random() * 100) >= percent ? "ExperienceA" : "ExperienceB";
};

export const emptyBusinessUser: BusinessUser = {
  name: undefined,
  email: "",
  id: uuidv4(),
  externalStatus: {},
  receiveNewsletter: true,
  userTesting: true,
  myNJUserKey: undefined,
  intercomHash: undefined,
  abExperience: decideABExperience(),
};

export const createEmptyUser = (abExperience?: ABExperience): BusinessUser => ({
  ...emptyBusinessUser,
  abExperience: abExperience ?? decideABExperience(),
});

export type ExternalStatus = {
  readonly newsletter?: NewsletterResponse;
  readonly userTesting?: UserTestingResponse;
};

export interface NewsletterResponse {
  readonly success?: boolean;
  readonly status: NewsletterStatus;
}

export interface UserTestingResponse {
  readonly success?: boolean;
  readonly status: UserTestingStatus;
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
