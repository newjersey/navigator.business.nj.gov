import dayjs from "dayjs";

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

export type ElevatorSafetyViolation = {
  citationDate: string;
  isOpen: boolean;
  inspectorRemarks: string;
  dueDate?: string;
};

export type ElevatorSafetyAddress = {
  address1: string;
  address2?: string;
  municipalityExternalId?: string;
  municipalityName?: string;
};

export function generateElevatorSafetyRegistrationSummary(
  overrides?: Partial<ElevatorSafetyRegistrationSummary>
): ElevatorSafetyRegistrationSummary {
  return {
    lookupStatus: "SUCCESSFUL",
    registrations: [generateElevatorSafetyRegistration()],
    ...overrides,
  };
}

export function generateElevatorSafetyRegistration(
  overrides?: Partial<ElevatorSafetyRegistration>
): ElevatorSafetyRegistration {
  return {
    dateStarted: dayjs().toString(),
    deviceCount: 1,
    status: "APPROVED",
    ...overrides,
  };
}
