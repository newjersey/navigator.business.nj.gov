import {
  BusinessSuffix,
  FormationSubmitError,
  FormationSubmitResponse,
  GetFilingResponse,
} from "@shared/formationData";
import { UserData } from "@shared/userData";
import axios from "axios";
import dayjs from "dayjs";
import { FormationClient } from "../domain/types";
import { LogWriterType } from "../libs/logWriter";
import { splitErrorField } from "./splitErrorField";

type ApiConfig = {
  account: string;
  key: string;
  baseUrl: string;
};

export const ApiFormationClient = (config: ApiConfig, logger: LogWriterType): FormationClient => {
  const form = (userData: UserData, returnUrl: string): Promise<FormationSubmitResponse> => {
    const postBody = makePostBody(userData, returnUrl, config);
    logger.LogInfo(
      `Formation - NICUSA - Request Sent to ${config.baseUrl}/PrepareFiling data: ${JSON.stringify(postBody)}`
    );
    return axios
      .post(`${config.baseUrl}/PrepareFiling`, postBody)
      .then((response) => {
        logger.LogInfo(`Formation - NICUSA - Response received: ${JSON.stringify(response.data)}`);
        if (response.data.Success && response.data.Success === true) {
          const successResponse = response.data as ApiResponse;
          return {
            success: true,
            token: successResponse.PayUrl.PortalPayId,
            formationId: successResponse.Id,
            redirect: successResponse.PayUrl.RedirectToUrl,
            errors: [],
          };
        } else {
          let errors = [] as FormationSubmitError[];
          logger.LogInfo(`Formation - NICUSA - Response error received: ${JSON.stringify(response.data)}`);
          if (Array.isArray(response.data)) {
            const apiError = response.data as ApiErrorResponse;
            errors = apiError.map((error) => ({
              field: splitErrorField(error.Name),
              message: error.ErrorMessage,
              type: "FIELD",
            }));
          } else {
            errors = [{ field: "", message: "Response Error", type: "RESPONSE" }];
          }
          return {
            success: false,
            formationId: undefined,
            token: undefined,
            redirect: undefined,
            errors,
          };
        }
      })
      .catch((error) => {
        logger.LogInfo(`Formation - NICUSA - Unknown error received: ${JSON.stringify(error)}`);
        return {
          success: false,
          token: undefined,
          formationId: undefined,
          redirect: undefined,
          errors: [{ field: "", message: "Unknown Error", type: "UNKNOWN" }],
        };
      });
  };

  const getCompletedFiling = (formationId: string): Promise<GetFilingResponse> => {
    const postBody = {
      Account: config.account,
      Key: config.key,
      FormationId: formationId,
    };
    logger.LogInfo(
      `GetFiling - NICUSA - Request Sent to ${config.baseUrl}/GetCompletedFiling data: ${JSON.stringify(
        postBody
      )}`
    );
    return axios
      .post(`${config.baseUrl}/GetCompletedFiling`, postBody)
      .then((response) => {
        logger.LogInfo(`GetFiling - NICUSA - Response received: ${JSON.stringify(response.data)}`);
        if (response.data.Success && response.data.Success === true) {
          const successResponse = response.data as ApiGetFilingResponse;
          return {
            success: successResponse.Success,
            entityId: successResponse.EntityId,
            transactionDate: successResponse.TransactionDate,
            confirmationNumber: successResponse.ConfirmationNumber,
            formationDoc: successResponse.FormationDoc,
            standingDoc: successResponse.StandingDoc,
            certifiedDoc: successResponse.CertifiedDoc,
          };
        } else {
          return {
            success: false,
            entityId: "",
            transactionDate: "",
            confirmationNumber: "",
            formationDoc: "",
            standingDoc: "",
            certifiedDoc: "",
          };
        }
      })
      .catch((error) => {
        logger.LogInfo(`GetFiling - NICUSA - Unknown error received: ${JSON.stringify(error)}`);
        return {
          success: false,
          entityId: "",
          transactionDate: "",
          confirmationNumber: "",
          formationDoc: "",
          standingDoc: "",
          certifiedDoc: "",
        };
      });
  };

  const makePostBody = (userData: UserData, returnUrl: string, config: ApiConfig) => {
    const formationFormData = userData.formationData.formationFormData;
    const isManual = formationFormData.agentNumberOrManual === "MANUAL_ENTRY";

    return {
      Account: config.account,
      Key: config.key,
      ReturnUrl: `${returnUrl}?completeFiling=true`,
      Formation: {
        Gov2GoAnnualReports: formationFormData.annualReportNotification,
        Gov2GoCorpWatch: formationFormData.corpWatchNotification,
        ShortGoodStanding: formationFormData.certificateOfStanding,
        Certified: formationFormData.certifiedCopyOfFormationDocument,
        PayerEmail: "",
        SelectPaymentType: formationFormData.paymentType,
        BusinessInformation: {
          CompanyOrigin: "Domestic",
          Business: "DomesticLimitedLiabilityCompany",
          BusinessName: formationFormData.businessName,
          BusinessDesignator: formationFormData.businessSuffix,
          EffectiveFilingDate: dayjs(formationFormData.businessStartDate, "YYYY-MM-DD").toISOString(),
          MainAddress: {
            Address1: formationFormData.businessAddressLine1,
            Address2: formationFormData.businessAddressLine2,
            City: userData.profileData.municipality?.name,
            State: "New Jersey",
            Zipcode: formationFormData.businessAddressZipCode,
            Country: "US",
          },
        },
        CompanyProfit: "Profit",
        RegisteredAgent: {
          Id: isManual ? null : formationFormData.agentNumber,
          Email: isManual ? formationFormData.agentEmail : null,
          Name: isManual ? formationFormData.agentName : null,
          Location: isManual
            ? {
                Address1: formationFormData.agentOfficeAddressLine1,
                Address2: formationFormData.agentOfficeAddressLine2,
                City: formationFormData.agentOfficeAddressCity,
                State: "New Jersey",
                Zipcode: formationFormData.agentOfficeAddressZipCode,
                Country: "US",
              }
            : null,
        },
        Members: formationFormData.members.map((member) => ({
          Name: member.name,
          Location: {
            Address1: member.addressLine1,
            Address2: member.addressLine2,
            City: member.addressCity,
            State: member.addressState,
            Zipcode: member.addressZipCode,
            Country: "US",
          },
        })),
        Signers: [
          {
            Name: formationFormData.signer,
            Title: "Authorized Representative",
            Signed: true,
          },
          ...formationFormData.additionalSigners.map((additionalSigner) => ({
            Name: additionalSigner,
            Title: "Authorized Representative",
            Signed: true,
          })),
        ],
        ContactFirstName: formationFormData.contactFirstName,
        ContactLastName: formationFormData.contactLastName,
        ContactPhoneNumber: formationFormData.contactPhoneNumber,
      },
    };
  };

  return {
    form,
    getCompletedFiling,
  };
};

export type ApiSubmission = {
  Account: string; //API User Account id
  Key: string; //API Account Key
  Formation: {
    Gov2GoAnnualReports: boolean; //This will dictate if the Payer’s email will be subscribed to G2G Annual Reports
    Gov2GoCorpWatch: boolean; //This will dictate if the Payer’s email will be subscribed to G2G Corpwatch
    ShortGoodStanding: boolean; //Option to order Good Standing Certificate
    Certified: boolean; //Option to order Certified Copy of the Formation
    PayerEmail: string;
    SelectPaymentType: "ACH" | "CC"; //Method user wishes to use to pay. Valid Values: ACH, CC
    BusinessInformation: {
      CompanyOrigin: "Domestic"; //Domestic if from Jersey. Valid Types: Domestic, Foreign
      Business: BusinessType; //Business Type (DomesticLimitedLiabilityCompany)
      BusinessName: string; //The requested business name, must be available and not contain any restricted words. Name plus designator length must be less than 100 characters in length.
      BusinessDesignator: BusinessSuffix; //The designator - LLC. L.L.C etc
      EffectiveFilingDate: string; // date 2021-12-14T10:03:51.0869073-04:00 (anne note: is this correct??)
      MainAddress: ApiLocation;
    };
    CompanyProfit: "Profit"; //Valid Values: Profit, NonProfit
    RegisteredAgent: {
      Id: string | null; // 7 max, must be valid NJ registered agent number
      Email: string | null; //50 max, must be email address
      Name: string | null; // 50 max, required if no ID
      Location: ApiLocation | null; // required if no ID
    };
    Members: Array<{
      Name: string; // 50 max
      Location: MemberLocation;
    }>;
    Signers: Array<{
      //This can be a list/array of items. Maximum 10
      Name: string; // max 50
      Title: "Authorized Representative";
      Signed: true;
    }>;
    ContactFirstName: string; //Contact person for filing
    ContactLastName: string;
    ContactPhoneNumber: string;
  };
};

type ApiLocation = {
  Address1: string; // 35 char max, Can not be left blank, if any other address field has data
  Address2: string; // max 35 char
  City: string; // 30 char max, Can not be left blank, if any other address field has data
  State: "New Jersey"; // required if country = US. Must be full state name. Ex: Alabama
  Zipcode: string; // max 5 if country=US, 11 otherwise
  Country: "US"; //alpha-2 iban code
};

type MemberLocation = {
  Address1: string; // 35 char max, Can not be left blank, if any other address field has data
  Address2: string; // max 35 char
  City: string; // 30 char max, Can not be left blank, if any other address field has data
  State: string; // required if country = US. Must be full state name. Ex: Alabama
  Zipcode: string; // max 5 if country=US, 11 otherwise
  Country: "US"; //alpha-2 iban code
};

type BusinessType = "DomesticLimitedLiabilityCompany";

export type ApiResponse = {
  Success: boolean;
  Id: string;
  PayUrl: {
    PortalPayId: string;
    RedirectToUrl: string;
    StatusCode: number;
  };
};

export type ApiError = {
  Valid: boolean;
  ErrorMessage: string;
  Name: string; // field with error
};

export type ApiErrorResponse = ApiError[];

export type ApiGetFilingResponse = {
  Success: boolean;
  BusinessName: string;
  EntityId: string;
  TransactionDate: string;
  ConfirmationNumber: string;
  FormationDoc: string;
  StandingDoc: string;
  CertifiedDoc: string;
};
