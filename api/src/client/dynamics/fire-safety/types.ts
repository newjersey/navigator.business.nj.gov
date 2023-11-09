export interface FireSafetyInspectionClient {
  getFireSafetyInspectionsByAddress: (
    accessToken: string,
    address: string
  ) => Promise<FireSafetyInspection[]>;
}

export type FireSafetyInspection = {
  createdOn: string;
  inspectionFinished: boolean;
  address: string;
  openViolationCount: number;
}