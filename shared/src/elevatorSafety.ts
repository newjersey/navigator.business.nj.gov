export type ElevatorSafetyDeviceInspectionDetails = {
  address: string;
  deviceCount: number;
  date: string;
  stateCode: number;
};

export type ElevatorSafetyRegistration = {
  dateStarted: string;
  deviceCount: number;
  status: string;
};

export type ElevatorSafetyRegistrationSummary = {
  registrations: ElevatorSafetyRegistration[];
  lookupStatus: string;
};
