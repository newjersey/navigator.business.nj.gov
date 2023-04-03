export type NameAvailabilityStatus =
  | "AVAILABLE"
  | "DESIGNATOR_ERROR"
  | "SPECIAL_CHARACTER_ERROR"
  | "UNAVAILABLE"
  | "RESTRICTED_ERROR"
  | undefined;

export interface NameAvailabilityResponse {
  status: NameAvailabilityStatus;
  similarNames: string[];
  invalidWord?: string;
}

export interface NameAvailability extends NameAvailabilityResponse {
  lastUpdatedTimeStamp: string;
}
