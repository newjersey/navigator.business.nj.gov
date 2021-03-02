import { BusinessForm } from "./form";

export interface UserDataClient {
  get: (userId: string) => Promise<UserData>;
  put: (userData: UserData) => Promise<UserData>;
}

export interface UserData {
  user: BusinessUser;
  formData: BusinessForm;
  formProgress: FormProgress;
}

export type FormProgress = "UNSTARTED" | "IN-PROGRESS" | "COMPLETED";

export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
};

export type LegalStructure =
  | "Sole Proprietorship"
  | "General Partnership"
  | "Limited Partnership (LP)"
  | "Limited Liability Partnership (LLP)"
  | "Limited Liability Company (LLC)"
  | "C-Corporation"
  | "S-Corporation"
  | "B-Corporation";

export const ALL_LEGAL_STRUCTURES: LegalStructure[] = [
  "Sole Proprietorship",
  "General Partnership",
  "Limited Partnership (LP)",
  "Limited Liability Partnership (LLP)",
  "Limited Liability Company (LLC)",
  "C-Corporation",
  "S-Corporation",
  "B-Corporation",
];
