import { parseDateWithFormat } from "@shared/dateHelpers";
import {
  BusinessSuffix,
  corpLegalStructures,
  FormationLegalType,
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
  account: string;
  key: string;
  baseUrl: string;
};

export const ApiFormationClient = (config: ApiConfig, logger: LogWriterType): FormationClient => {
  const logId = logger.GetId();
  const form = (userData: UserData, returnUrl: string): Promise<FormationSubmitResponse> => {
    const postBody = makePostBody(userData, returnUrl, config);
    logger.LogInfo(
      `Formation - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/PrepareFiling data: ${JSON.stringify(postBody)}`
    );
    return axios
      .post(`${config.baseUrl}/PrepareFiling`, postBody)
      .then((response) => {
        logger.LogInfo(
          `Formation - NICUSA - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
        );
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
          logger.LogInfo(
            `Formation - NICUSA - Id:${logId} - Response error received: ${JSON.stringify(response.data)}`
          );
          if (Array.isArray(response.data)) {
            const apiError = response.data as ApiErrorResponse;
            errors = apiError.map((error) => {
              return {
                field: splitErrorField(error.Name),
                message: error.ErrorMessage,
                type: "FIELD",
              };
            });
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
        logger.LogError(
          `Formation - NICUSA - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
        );
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
      `GetFiling - NICUSA - Id:${logId} - Request Sent to ${
        config.baseUrl
      }/GetCompletedFiling data: ${JSON.stringify(postBody)}`
    );
    return axios
      .post(`${config.baseUrl}/GetCompletedFiling`, postBody)
      .then((response) => {
        logger.LogInfo(
          `GetFiling - NICUSA - Id:${logId} - Response received: ${JSON.stringify(response.data)}`
        );
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
        logger.LogError(
          `GetFiling - NICUSA - Id:${logId} - Unknown error received: ${JSON.stringify(error)}`
        );
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
    const naicsCode = userData.profileData.naicsCode.length === 6 ? userData.profileData.naicsCode : "";
    const isCorp = userData.profileData.legalStructureId
      ? corpLegalStructures.includes(userData.profileData.legalStructureId as FormationLegalType)
      : false;
    const additionalProvisions =
      formationFormData.provisions.length > 0 ||
      BusinessTypeMap[userData.profileData.legalStructureId as FormationLegalType].additionalDataRequired
        ? {
            [BusinessTypeMap[userData.profileData.legalStructureId as FormationLegalType]
              .provisionsFieldName]: formationFormData.provisions.map((it: string) => {
              return { Provision: it };
            }),
            ...(userData.profileData.legalStructureId == "limited-partnership"
              ? {
                  AggregateAmount: formationFormData.combinedInvestment,
                  LimitedCanCreateLimited: formationFormData.canCreateLimitedPartner ? "Yes" : "No",
                  LimitedCanCreateLimitedTerms: formationFormData.createLimitedPartnerTerms,
                  LimitedCanGetDistribution: formationFormData.canGetDistribution ? "Yes" : "No",
                  LimitedCanGetDistributionTerms: formationFormData.getDistributionTerms,
                  LimitedCanMakeDistribution: formationFormData.canMakeDistribution ? "Yes" : "No",
                  LimitedCanMakeDistributionTerms: formationFormData.makeDistributionTerms,
                  GeneralPartnerWithdrawal: formationFormData.withdrawals,
                  DissolutionPlan: formationFormData.dissolution,
                }
              : {}),
          }
        : undefined;

    let Incorporators:
      | Array<{
          Name: string;
          Location: MemberLocation;
        }>
      | undefined;

    if (isCorp) {
      Incorporators = formationFormData.signers.map((signer) => {
        return {
          Name: signer.name,
          Location: {
            Address1: signer.addressLine1,
            Address2: signer.addressLine2,
            City: signer.addressCity,
            State: signer.addressState,
            Zipcode: signer.addressZipCode,
            Country: "US",
          } as MemberLocation,
        };
      });
    }

    return {
      Account: config.account,
      Key: config.key,
      ReturnUrl: `${returnUrl}?completeFiling=true`,
      FailureReturnUrl: `${returnUrl}?completeFiling=false`,
      Payer: {
        CompanyName: formationFormData.businessName,
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
          Business: BusinessTypeMap[userData.profileData.legalStructureId as FormationLegalType].businessType,
          BusinessName: formationFormData.businessName,
          BusinessDesignator: formationFormData.businessSuffix,
          Naic: naicsCode,
          BusinessPurpose: formationFormData.businessPurpose || undefined,
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
          TotalShares:
            formationFormData.businessTotalStock.length > 0
              ? Number.parseInt(formationFormData.businessTotalStock)
              : undefined,
        },
        [BusinessTypeMap[userData.profileData.legalStructureId as FormationLegalType].additionalDataKey]:
          additionalProvisions,
        CompanyProfit: "Profit",
        RegisteredAgent: {
          Id: isManual ? undefined : formationFormData.agentNumber,
          Email: isManual ? formationFormData.agentEmail : undefined,
          Name: isManual ? formationFormData.agentName : undefined,
          Location: isManual
            ? {
                Address1: formationFormData.agentOfficeAddressLine1,
                Address2: formationFormData.agentOfficeAddressLine2,
                City: formationFormData.agentOfficeAddressCity,
                State: "New Jersey",
                Zipcode: formationFormData.agentOfficeAddressZipCode,
                Country: "US",
              }
            : undefined,
        },
        MemberAttestation: isCorp ? true : undefined,
        Members: formationFormData.members.map((member) => {
          return {
            Name: member.name,
            Location: {
              Address1: member.addressLine1,
              Address2: member.addressLine2,
              City: member.addressCity,
              State: member.addressState,
              Zipcode: member.addressZipCode,
              Country: "US",
            },
          };
        }),
        Incorporators,
        Signers: formationFormData.signers.map((signer) => {
          return {
            Name: signer.name,
            Title: BusinessTypeMap[userData.profileData.legalStructureId as FormationLegalType].signerTitle,
            Signed: signer.signature,
          };
        }),

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
  Payer: {
    FirstName: string; // string (combined with LastName total 49), if not set will use ContactFirstName
    LastName: string; // string (combined with FirstName total 49), if not set will use ContactLastName
    CompanyName: string;
    Address1: string;
    Address2: string;
    City: string;
    StateAbbreviation: string; // 2 chars
    ZipCode: string; // 5 chars
    PhoneNumber: string; // 12 chars, if not set ContactPhoneNumber will be used
    Email: string;
  };
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
      Naic: string; // If supplied must be 6 digits
      BusinessPurpose: string; // Max 300 chars
      EffectiveFilingDate: string; // date 2021-12-14T10:03:51.0869073-04:00 (anne note: is this correct??)
      MainAddress: ApiLocation;
      TotalShares: number | undefined;
    };
    AdditionalLimitedLiabilityCompany?: {
      OtherProvisions: AdditionalProvision[];
    };
    AdditionalLimitedLiabilityPartnership?: {
      OtherProvisions: AdditionalProvision[];
    };
    AdditionalCCorpOrProfessionalCorp?: {
      OtherProvisions: AdditionalProvision[];
    };
    AdditionalLimitedPartnership?: {
      AggregateAmount: string; // Max 400 chars
      LimitedCanCreateLimited: "Yes" | "No";
      LimitedCanCreateLimitedTerms: string; // Max 400 chars
      LimitedCanGetDistribution: "Yes" | "No";
      LimitedCanGetDistributionTerms: string; // Max 400 chars
      LimitedCanMakeDistribution: "Yes" | "No";
      LimitedCanMakeDistributionTerms: string; // Max 400 chars
      GeneralPartnerWithdrawal: string; // Max 400 chars
      DissolutionPlan: string; // Max 400 chars
      AdditionalProvision: AdditionalProvision[];
    };
    CompanyProfit: "Profit"; //Valid Values: Profit, NonProfit
    RegisteredAgent: {
      Id: string | null; // 7 max, must be valid NJ registered agent number
      Email: string | null; //50 max, must be email address
      Name: string | null; // 50 max, required if no ID
      Location: ApiLocation | null; // required if no ID
    };
    MemberAttestation: boolean | undefined;
    Incorporators: Array<{
      Name: string; // 50 max
      Location: MemberLocation;
    }>;
    Members: Array<{
      Name: string; // 50 max
      Location: MemberLocation;
    }>;
    Signers: Array<{
      //This can be a list/array of items. Maximum 10
      Name: string; // max 50
      Title: SignerTitle;
      Signed: true;
    }>;
    ContactFirstName: string; //Contact person for filing
    ContactLastName: string;
    ContactPhoneNumber: string;
  };
};

type AdditionalProvision = {
  Provision: string; // max 400 chars
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

type BusinessType =
  | "DomesticLimitedLiabilityCompany"
  | "DomesticLimitedLiabilityPartnership"
  | "DomesticForProfitCorporation"
  | "DomesticLimitedPartnership";

type SignerTitle = "Authorized Representative" | "Authorized Partner" | "Incorporator" | "General Partner";

type AdditionalDataKey =
  | "AdditionalCCorpOrProfessionalCorp"
  | "AdditionalLimitedLiabilityCompany"
  | "AdditionalLimitedLiabilityPartnership"
  | "AdditionalLimitedPartnership";

type FormationFields = {
  businessType: BusinessType;
  shortDescription: string;
  signerTitle: SignerTitle;
  additionalDataKey: AdditionalDataKey;
  additionalDataRequired?: boolean;
  provisionsFieldName: string;
};

const BusinessTypeMap: Record<FormationLegalType, FormationFields> = {
  "limited-liability-company": {
    businessType: "DomesticLimitedLiabilityCompany",
    shortDescription: "LLC",
    signerTitle: "Authorized Representative",
    additionalDataKey: "AdditionalLimitedLiabilityCompany",
    provisionsFieldName: "OtherProvisions",
  },
  "limited-liability-partnership": {
    businessType: "DomesticLimitedLiabilityPartnership",
    shortDescription: "LLP",
    signerTitle: "Authorized Partner",
    additionalDataKey: "AdditionalLimitedLiabilityPartnership",
    provisionsFieldName: "OtherProvisions",
  },
  "limited-partnership": {
    businessType: "DomesticLimitedPartnership",
    shortDescription: "LP",
    signerTitle: "General Partner",
    additionalDataRequired: true,
    additionalDataKey: "AdditionalLimitedPartnership",
    provisionsFieldName: "AdditionalProvisions",
  },
  "c-corporation": {
    businessType: "DomesticForProfitCorporation",
    shortDescription: "DP",
    signerTitle: "Incorporator",
    additionalDataKey: "AdditionalCCorpOrProfessionalCorp",
    provisionsFieldName: "AdditionalProvisions",
  },
  "s-corporation": {
    businessType: "DomesticForProfitCorporation",
    shortDescription: "DP",
    signerTitle: "Incorporator",
    additionalDataKey: "AdditionalCCorpOrProfessionalCorp",
    provisionsFieldName: "AdditionalProvisions",
  },
};

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
