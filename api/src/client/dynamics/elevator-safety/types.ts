export interface ElevatorSafetyInspectionClient {
  getElevatorInspections: (accessToken: string, address: string) => Promise<ElevatorInspection[]>;
}

export interface ElevatorSafetyRegistrationClient {
  getElevatorRegistrationsForBuilding: (
    accessToken: string,
    propertyInterestId: string
  ) => Promise<ElevatorRegistration[]>;
}

export type ElevatorInspection = {
  address: string;
  deviceCount: number;
  date: string;
  stateCode: number;
};

export type ElevatorRegistration = {
  dateStarted: string;
  deviceCount: number;
  status: ElevatorRegistrationStatus;
};

export type ElevatorRegistrationSummary = {
  registrations: ElevatorRegistration[];
  lookupStatus: ElevatorRegistrationLookupStatus;
};

export type ElevatorRegistrationLookupStatus =
  | "SUCCESSFUL"
  | "NO REGISTRATIONS FOUND"
  | "NO PROPERTY INTERESTS FOUND";

export type ElevatorRegistrationStatus =
  | "APPROVED"
  | "INCOMPLETE"
  | "RETURNED"
  | "REJECTED"
  | "IN REVIEW"
  | "CANCELLED"
  | "UNRECOGNIZED STATUS";

export type ElevatorSafetyInspectionInfo = (address: string) => Promise<ElevatorInspection[]>;

export type ElevatorRegistrationInfo = (
  address: string,
  zipCode: string
) => Promise<ElevatorRegistrationSummary>;
