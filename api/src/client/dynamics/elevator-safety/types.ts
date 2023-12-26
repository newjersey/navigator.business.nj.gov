import { HealthCheckResponse } from "@domain/types";

export interface ElevatorSafetyInspectionClient {
  getElevatorInspections: (accessToken: string, address: string) => Promise<ElevatorInspection[]>;
  getAnyElevatorInspections: (accessToken: string) => Promise<HealthCheckResponse>;
}

export type ElevatorInspection = {
  address: string;
  deviceCount: number;
  date: string;
  stateCode: number;
};

export type ElevatorSafetyInspectionInfo = (address: string) => Promise<ElevatorInspection[]>;
