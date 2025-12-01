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
  totalUiHcWf: string;
  totalFli: string;
  taxableWageBase: string;
  baseWeekAmt: string;
  numberOfBaseWeeks: string;
  taxableWageBaseDiFli: string;
  error: string;
};
