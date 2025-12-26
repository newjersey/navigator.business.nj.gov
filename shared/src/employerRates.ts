export const DOL_EIN_CHARACTERS = 15;

export type EmployerRatesRequest = {
  businessName: string;
  email: string;
  ein: string;
  qtr: number;
  year: number;
};

export type EmployerRatesResponse = {
  employerUiRate: string;
  employerWfRate: string;
  employerHcRate: string;
  employerDiRate: string;
  workerUiRate: string;
  workerWfRate: string;
  workerHcRate: string;
  workerDiRate: string;
  workerFliRate: string;
  totalDi: string;
  TotalUiHcWf: string;
  TotalFli: string;
  taxableWageBase: string;
  baseWeekAmt: string;
  numberOfBaseWeeks: string;
  taxableWageBaseDiFli: string;
  error?: string;
};
