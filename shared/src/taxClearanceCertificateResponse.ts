import { UserData } from "@businessnjgovnavigator/shared/userData";

export type TaxClearanceCertificateResponseErrorType =
  | "INELIGIBLE_TAX_CLEARANCE_FORM"
  | "FAILED_TAX_ID_AND_PIN_VALIDATION"
  | "MISSING_FIELD"
  | "NATURAL_PROGRAM_ERROR"
  | "TAX_ID_MISSING_FIELD"
  | "TAX_ID_MISSING_FIELD_WITH_EXTRA_SPACE"
  | "SYSTEM_ERROR"
  | "TAX_ID_IN_USE_BY_ANOTHER_BUSINESS_ACCOUNT"
  | "BUSINESS_STATUS_VERIFICATION_ERROR";

type ErrorResponse = {
  error: {
    type: TaxClearanceCertificateResponseErrorType;
    message: string;
  };
};

type SuccessResponse = {
  userData: UserData;
  certificatePdfArray: number[];
};

export interface UnlinkTaxIdResponse {
  success: boolean;
  error?: {
    message: string;
  };
}

export type TaxClearanceCertificateResponse = ErrorResponse | SuccessResponse;
