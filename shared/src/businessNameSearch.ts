export type NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export type NameAvailability = {
  status: NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
};
