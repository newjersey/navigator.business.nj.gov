export interface UserDataClient {
  get: (userId: string) => Promise<UserData>;
  put: (userData: UserData) => Promise<UserData>;
}

export interface BusinessNameRepo {
  search: (name: string) => Promise<string[]>;
  save: (name: string) => Promise<void>;
  disconnect: () => Promise<void>;
  deleteAll: () => Promise<void>;
}

export type SearchBusinessName = (name: string) => Promise<NameAvailability>;

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface UserData {
  user: BusinessUser;
  onboardingData: OnboardingData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
}

export interface OnboardingData {
  businessName: string;
  industry: Industry | undefined;
  legalStructure: LegalStructure | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
}

export type Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

export type Industry = "restaurant" | "e-commerce" | "home-contractor" | "cosmetology" | "generic";
export const ALL_INDUSTRIES: Industry[] = [
  "restaurant",
  "e-commerce",
  "home-contractor",
  "cosmetology",
  "generic",
];

export type LegalStructure =
  | "sole-proprietorship"
  | "general-partnership"
  | "limited-partnership"
  | "limited-liability-partnership"
  | "limited-liability-company"
  | "c-corporation"
  | "s-corporation"
  | "b-corporation";

export const ALL_LEGAL_STRUCTURES: LegalStructure[] = [
  "sole-proprietorship",
  "general-partnership",
  "limited-partnership",
  "limited-liability-partnership",
  "limited-liability-company",
  "c-corporation",
  "s-corporation",
  "b-corporation",
];
