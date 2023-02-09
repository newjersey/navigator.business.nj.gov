export type NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR"
  | "SPECIAL_CHARACTER"
  | "UNAVAILABLE"
  | "RESTRICTED";

export type NameAvailability = {
  status: NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
};
