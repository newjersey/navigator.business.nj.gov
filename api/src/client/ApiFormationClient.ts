import { parseDateWithFormat } from "@shared/dateHelpers";
import {
  BusinessSuffix,
  FormationSubmitError,
  FormationSubmitResponse,
  GetFilingResponse,
} from "@shared/formationData";
import { UserData } from "@shared/userData";
import axios from "axios";
import { FormationClient } from "../domain/types";
import { LogWriterType } from "../libs/logWriter";
import { splitErrorField } from "./splitErrorField";

type ApiConfig = {
  readonly account: string;
  readonly key: string;
  readonly baseUrl: string;
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
          let errors = [] as readonly FormationSubmitError[];
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
      Payer: {
        CompanyName: userData.profileData.businessName,
        Address1: formationFormData.businessAddressLine1,
        Address2: formationFormData.businessAddressLine2,
        City: formationFormData.businessAddressCity?.name,
        StateAbbreviation: "NJ",
        ZipCode: formationFormData.businessAddressZipCode,
        Email: userData.user.email,
      },
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
          BusinessName: userData.profileData.businessName,
          BusinessDesignator: formationFormData.businessSuffix,
          EffectiveFilingDate: parseDateWithFormat(
            formationFormData.businessStartDate,
            "YYYY-MM-DD"
          ).toISOString(),
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
            Name: formationFormData.signer.name,
            Title: "Authorized Representative",
            Signed: formationFormData.signer.signature,
          },
          ...formationFormData.additionalSigners.map((additionalSigner) => ({
            Name: additionalSigner.name,
            Title: "Authorized Representative",
            Signed: additionalSigner.signature,
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
  readonly Account: string; //API User Account id
  readonly Key: string; //API Account Key
  readonly Payer: {
    readonly FirstName: string; // string (combined with LastName total 49), if not set will use ContactFirstName
    readonly LastName: string; // string (combined with FirstName total 49), if not set will use ContactLastName
    readonly CompanyName: string;
    readonly Address1: string;
    readonly Address2: string;
    readonly City: string;
    readonly StateAbbreviation: string; // 2 chars
    readonly ZipCode: string; // 5 chars
    readonly PhoneNumber: string; // 12 chars, if not set ContactPhoneNumber will be used
    readonly Email: string;
  };
  readonly Formation: {
    readonly Gov2GoAnnualReports: boolean; //This will dictate if the Payer’s email will be subscribed to G2G Annual Reports
    readonly Gov2GoCorpWatch: boolean; //This will dictate if the Payer’s email will be subscribed to G2G Corpwatch
    readonly ShortGoodStanding: boolean; //Option to order Good Standing Certificate
    readonly Certified: boolean; //Option to order Certified Copy of the Formation
    readonly PayerEmail: string;
    readonly SelectPaymentType: "ACH" | "CC"; //Method user wishes to use to pay. Valid Values: ACH, CC
    readonly BusinessInformation: {
      readonly CompanyOrigin: "Domestic"; //Domestic if from Jersey. Valid Types: Domestic, Foreign
      readonly Business: BusinessType; //Business Type (DomesticLimitedLiabilityCompany)
      readonly BusinessName: string; //The requested business name, must be available and not contain any restricted words. Name plus designator length must be less than 100 characters in length.
      readonly BusinessDesignator: BusinessSuffix; //The designator - LLC. L.L.C etc
      readonly EffectiveFilingDate: string; // date 2021-12-14T10:03:51.0869073-04:00 (anne note: is this correct??)
      readonly MainAddress: ApiLocation;
    };
    readonly CompanyProfit: "Profit"; //Valid Values: Profit, NonProfit
    readonly RegisteredAgent: {
      readonly Id: string | null; // 7 max, must be valid NJ registered agent number
      readonly Email: string | null; //50 max, must be email address
      readonly Name: string | null; // 50 max, required if no ID
      readonly Location: ApiLocation | null; // required if no ID
    };
    readonly Members: ReadonlyArray<{
      readonly Name: string; // 50 max
      readonly Location: MemberLocation;
    }>;
    readonly Signers: ReadonlyArray<{
      //This can be a list/array of items. Maximum 10
      readonly Name: string; // max 50
      readonly Title: "Authorized Representative";
      readonly Signed: true;
    }>;
    readonly ContactFirstName: string; //Contact person for filing
    readonly ContactLastName: string;
    readonly ContactPhoneNumber: string;
  };
};

type ApiLocation = {
  readonly Address1: string; // 35 char max, Can not be left blank, if any other address field has data
  readonly Address2: string; // max 35 char
  readonly City: string; // 30 char max, Can not be left blank, if any other address field has data
  readonly State: "New Jersey"; // required if country = US. Must be full state name. Ex: Alabama
  readonly Zipcode: string; // max 5 if country=US, 11 otherwise
  readonly Country: "US"; //alpha-2 iban code
};

type MemberLocation = {
  readonly Address1: string; // 35 char max, Can not be left blank, if any other address field has data
  readonly Address2: string; // max 35 char
  readonly City: string; // 30 char max, Can not be left blank, if any other address field has data
  readonly State: string; // required if country = US. Must be full state name. Ex: Alabama
  readonly Zipcode: string; // max 5 if country=US, 11 otherwise
  readonly Country: "US"; //alpha-2 iban code
};

type BusinessType = "DomesticLimitedLiabilityCompany";

export type ApiResponse = {
  readonly Success: boolean;
  readonly Id: string;
  readonly PayUrl: {
    readonly PortalPayId: string;
    readonly RedirectToUrl: string;
    readonly StatusCode: number;
  };
};

export type ApiError = {
  readonly Valid: boolean;
  readonly ErrorMessage: string;
  readonly Name: string; // field with error
};

export type ApiErrorResponse = readonly ApiError[];

export type ApiGetFilingResponse = {
  readonly Success: boolean;
  readonly BusinessName: string;
  readonly EntityId: string;
  readonly TransactionDate: string;
  readonly ConfirmationNumber: string;
  readonly FormationDoc: string;
  readonly StandingDoc: string;
  readonly CertifiedDoc: string;
};
