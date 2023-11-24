export interface FireSafetyInspectionClient {
  getFireSafetyInspections: (accessToken: string, address: string) => Promise<FireSafetyInspection[]>;
}

export type FireSafetyInspection = {
  createdOn: string;
  inspectionFinished: boolean;
  address: string;
  openViolationCount: number;
};

export type FireSafetyInfo = (address: string) => Promise<FireSafetyInspection[]>;
