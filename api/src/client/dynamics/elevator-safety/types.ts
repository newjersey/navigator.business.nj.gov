export interface ElevatorSafetyInspectionClient {
  getElevatorInspections: (accessToken: string, address: string) => Promise<ElevatorInspection[]>;
}

export type ElevatorInspection = {
  address: string;
  deviceCount: number;
  date: string;
  stateCode: number;
};

export type ElevatorSafetyInspectionInfo = (address: string) => Promise<ElevatorInspection[]>;
