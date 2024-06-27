import { CountriesShortCodes } from "@shared/countries";
import { parseDateWithFormat } from "@shared/dateHelpers";
import { defaultDateFormat } from "@shared/defaultConstants";
import { getCurrentBusiness } from "@shared/domain-logic/getCurrentBusiness";
import {
  BusinessSuffix,
  formationApiDateFormat,
  FormationLegalType,
  InputFile,
  PaymentType,
  SignerTitle,
} from "@shared/formationData";
import { StateNames, StateShortCodes } from "@shared/states";
import { UserData } from "@shared/userData";

export type ApiConfig = {
  account: string;
  key: string;
  baseUrl: string;
};

export const makePostBody = (
  userData: UserData,
  returnUrl: string,
  config: ApiConfig,
  foreignGoodStandingFile: InputFile | undefined
): ApiSubmission => {
  const currentBusiness = getCurrentBusiness(userData);
  const formationFormData = currentBusiness.formationData.formationFormData;

  const isManual = formationFormData.agentNumberOrManual === "MANUAL_ENTRY";

  const isForeign = currentBusiness.profileData.businessPersona === "FOREIGN";
  const isVeteranNonprofit = formationFormData.isVeteranNonprofit;

  const toFormationLegalStructure = (): FormationLegalType | "veteran-nonprofit" => {
    if (isForeign) {
      return `foreign-${currentBusiness.profileData.legalStructureId}` as FormationLegalType;
    } else if (isVeteranNonprofit) {
      return "veteran-nonprofit";
    }
    return currentBusiness.profileData.legalStructureId as FormationLegalType;
  };

  const naicsCode =
    currentBusiness.profileData.naicsCode.length === 6 ? currentBusiness.profileData.naicsCode : "";

  const businessType = BusinessTypeMap[toFormationLegalStructure()];

  const isCorp = businessType.shortDescription === "DP";
  const isForeignCorp = businessType.shortDescription === "FR";
  const isDomesticNonProfit = businessType.shortDescription === ("NP" || "NV");

  const isInFormAndTerms = (
    input: "IN_BYLAWS" | "IN_FORM" | undefined,
    terms: string | undefined
  ): string | undefined => {
    return input === "IN_FORM" ? terms : undefined;
  };

  // eslint-disable-next-line unicorn/consistent-function-scoping
  const isInFormOrBylaw = (input: "IN_BYLAWS" | "IN_FORM" | undefined): "Herein" | "Bylaw" => {
    return input === "IN_FORM" ? "Herein" : "Bylaw";
  };

  const getAdditionalProvisions = (): Provisions => {
    const additionalProvisions =
      formationFormData.additionalProvisions?.map((it: string) => {
        return { Provision: it };
      }) ?? [];

    switch (toFormationLegalStructure()) {
      case "limited-partnership": {
        return {
          AdditionalLimitedPartnership: {
            AggregateAmount: formationFormData.combinedInvestment,
            LimitedCanCreateLimited: formationFormData.canCreateLimitedPartner ? "Yes" : "No",
            LimitedCanCreateLimitedTerms: formationFormData.createLimitedPartnerTerms,
            LimitedCanGetDistribution: formationFormData.canGetDistribution ? "Yes" : "No",
            LimitedCanGetDistributionTerms: formationFormData.getDistributionTerms,
            LimitedCanMakeDistribution: formationFormData.canMakeDistribution ? "Yes" : "No",
            LimitedCanMakeDistributionTerms: formationFormData.makeDistributionTerms,
            GeneralPartnerWithdrawal: formationFormData.withdrawals,
            DissolutionPlan: formationFormData.dissolution,
            AdditionalProvisions: additionalProvisions,
          },
        };
      }
      case "foreign-limited-partnership": {
        return {
          AdditionalForeignLimitedPartnership: {
            AggregateAmount: formationFormData.combinedInvestment,
            AdditionalProvisions: additionalProvisions,
          },
        };
      }
      case "limited-liability-company": {
        return {
          AdditionalLimitedLiabilityCompany: {
            OtherProvisions: additionalProvisions,
          },
        };
      }
      case "limited-liability-partnership": {
        return {
          AdditionalLimitedLiabilityPartnership: {
            OtherProvisions: additionalProvisions,
          },
        };
      }
      case "nonprofit":
      case "veteran-nonprofit": {
        return {
          AdditionalDomesticNonProfitCorp: {
            HasMembers: formationFormData.hasNonprofitBoardMembers ? "Yes" : "No",
            MemberTermsProvisionLocation: isInFormOrBylaw(
              formationFormData.nonprofitBoardMemberQualificationsSpecified
            ),
            MemberTerms: isInFormAndTerms(
              formationFormData.nonprofitBoardMemberQualificationsSpecified,
              formationFormData.nonprofitBoardMemberQualificationsTerms
            ),

            MemberClassPermissionsProvisionLocation: isInFormOrBylaw(
              formationFormData.nonprofitBoardMemberRightsSpecified
            ),
            MemberClassPermissions: isInFormAndTerms(
              formationFormData.nonprofitBoardMemberRightsSpecified,
              formationFormData.nonprofitBoardMemberRightsTerms
            ),
            TrusteeElectionProcessProvisionLocation: isInFormOrBylaw(
              formationFormData.nonprofitTrusteesMethodSpecified
            ),
            TrusteeElectionProcess: isInFormAndTerms(
              formationFormData.nonprofitTrusteesMethodSpecified,
              formationFormData.nonprofitTrusteesMethodTerms
            ),
            AssetDistributionProvisionLocation: isInFormOrBylaw(
              formationFormData.nonprofitAssetDistributionSpecified
            ),
            AssetDistribution: isInFormAndTerms(
              formationFormData.nonprofitAssetDistributionSpecified,
              formationFormData.nonprofitAssetDistributionTerms
            ),
          },
        };
      }

      default:
        if (["c-corporation", "s-corporation"].includes(toFormationLegalStructure())) {
          return {
            AdditionalCCorpOrProfessionalCorp: {
              AdditionalProvisions: additionalProvisions,
            },
          };
        }
    }
    return {};
  };

  const getPracticesLaw = (): "Yes" | "No" | undefined => {
    if (isForeignCorp && formationFormData.willPracticeLaw !== undefined) {
      return formationFormData.willPracticeLaw ? "Yes" : "No";
    }
    return undefined;
  };

  return {
    Account: config.account,
    Key: config.key,
    ReturnUrl: `${returnUrl}?completeFiling=true`,
    FailureReturnUrl: `${returnUrl}?completeFiling=false`,
    ForeignGoodStandingFile: foreignGoodStandingFile
      ? {
          Extension: foreignGoodStandingFile.fileType,
          Content: foreignGoodStandingFile.base64Contents,
        }
      : undefined,
    Payer: {
      CompanyName: formationFormData.businessName,
      Address1: isForeign ? "" : formationFormData.addressLine1,
      Address2: isForeign ? "" : formationFormData.addressLine2,
      City: isForeign
        ? ""
        : formationFormData.addressMunicipality?.name ?? formationFormData.addressCity ?? "",
      StateAbbreviation: isForeign ? undefined : formationFormData.addressState?.shortCode,
      ZipCode: isForeign ? "" : formationFormData.addressZipCode,
      Email: userData.user.email,
    },
    Formation: {
      Gov2GoAnnualReports: formationFormData.annualReportNotification,
      Gov2GoCorpWatch: formationFormData.corpWatchNotification,
      ShortGoodStanding: formationFormData.certificateOfStanding,
      Certified: formationFormData.certifiedCopyOfFormationDocument,
      PayerEmail: userData.user.email,
      SelectPaymentType: formationFormData.paymentType as Exclude<PaymentType, undefined>,
      BusinessInformation: {
        CompanyOrigin: isForeign ? "Foreign" : "Domestic",
        Business: BusinessTypeMap[toFormationLegalStructure()].businessType,
        BusinessName: formationFormData.businessName,
        BusinessDesignator: formationFormData.businessSuffix as Exclude<BusinessSuffix, undefined>,
        Naic: naicsCode,
        PracticesLaw: getPracticesLaw(),
        ForeignStateOfFormation: formationFormData.foreignStateOfFormation,
        ForeignDateOfFormation: formationFormData.foreignDateOfFormation
          ? parseDateWithFormat(formationFormData.foreignDateOfFormation, defaultDateFormat).format(
              formationApiDateFormat
            )
          : undefined,
        BusinessPurpose: formationFormData.businessPurpose || undefined,
        EffectiveFilingDate: parseDateWithFormat(
          formationFormData.businessStartDate,
          defaultDateFormat
        ).format(formationApiDateFormat),
        MainAddress: {
          Address1: formationFormData.addressLine1,
          Address2: formationFormData.addressLine2,
          City: formationFormData.addressMunicipality?.name ?? formationFormData.addressCity ?? "",
          State: formationFormData.addressState?.name,
          Province: formationFormData.addressProvince,
          Zipcode: formationFormData.addressZipCode,
          Country: formationFormData.addressCountry,
        },
        TotalShares:
          formationFormData.businessTotalStock.length > 0
            ? Number.parseInt(formationFormData.businessTotalStock)
            : undefined,
      },
      ...getAdditionalProvisions(),
      CompanyProfit: isDomesticNonProfit || isVeteranNonprofit ? "NonProfit" : "Profit",
      RegisteredAgent: {
        Id: isManual ? undefined : formationFormData.agentNumber,
        Email: isManual ? formationFormData.agentEmail : undefined,
        Name: isManual ? formationFormData.agentName : undefined,
        Location: isManual
          ? {
              Address1: formationFormData.agentOfficeAddressLine1,
              Address2: formationFormData.agentOfficeAddressLine2,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              City: formationFormData.agentOfficeAddressCity,
              State: "New Jersey",
              Zipcode: formationFormData.agentOfficeAddressZipCode,
              Country: "US",
            }
          : undefined,
      },
      MemberAttestation: isCorp && !isForeignCorp ? true : undefined,
      Members:
        businessType.shortDescription === "LP"
          ? formationFormData.incorporators?.map((member) => {
              return {
                Name: member.name,
                Location: {
                  Address1: member.addressLine1,
                  Address2: member.addressLine2,
                  City: member.addressMunicipality?.name ?? member.addressCity ?? "",
                  State: member.addressState?.name,
                  Zipcode: member.addressZipCode,
                  Country: "US",
                },
              };
            })
          : formationFormData.members?.map((member) => {
              return {
                Name: member.name,
                Location: {
                  Address1: member.addressLine1,
                  Address2: member.addressLine2,
                  City: member.addressMunicipality?.name ?? member.addressCity ?? "",
                  State: member.addressState?.name,
                  Zipcode: member.addressZipCode,
                  Country: "US",
                },
              };
            }),
      Incorporators: isCorp
        ? formationFormData.incorporators?.map((signer) => {
            return {
              Name: signer.name,
              Location: {
                Address1: signer.addressLine1,
                Address2: signer.addressLine2,
                City: signer.addressMunicipality?.name ?? signer.addressCity ?? "",
                State: signer.addressState?.name,
                Zipcode: signer.addressZipCode,
                Country: "US",
              },
            };
          })
        : undefined,
      Signers: formationFormData.incorporators
        ? formationFormData.incorporators?.map((signer) => {
            return {
              Name: signer.name,
              Title: signer.title,
              Signed: signer.signature,
            };
          }) ?? []
        : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          formationFormData.signers?.map((signer) => {
            return {
              Name: signer.name,
              Title: signer.title,
              Signed: signer.signature,
            };
          }) ?? [],

      ContactFirstName: formationFormData.contactFirstName,
      ContactLastName: formationFormData.contactLastName,
      ContactPhoneNumber: formationFormData.contactPhoneNumber,
      ContactEmail: userData.user.email,
    },
  };
};

type AdditionalLimitedPartnershipProvision = {
  AggregateAmount: string; // Max 400 chars
  LimitedCanCreateLimited: "Yes" | "No";
  LimitedCanCreateLimitedTerms: string; // Max 400 chars
  LimitedCanGetDistribution: "Yes" | "No";
  LimitedCanGetDistributionTerms: string; // Max 400 chars
  LimitedCanMakeDistribution: "Yes" | "No";
  LimitedCanMakeDistributionTerms: string; // Max 400 chars
  GeneralPartnerWithdrawal: string; // Max 400 chars
  DissolutionPlan: string; // Max 400 chars
  AdditionalProvisions: AdditionalProvision[];
};
type AdditionalForeignLimitedPartnershipProvision = {
  AggregateAmount: string; // Max 400 chars
  AdditionalProvisions: AdditionalProvision[];
};

type AdditionalDomesticNonProfitCorp = {
  HasMembers: "Yes" | "No";
  MemberTermsProvisionLocation: "Bylaw" | "Herein";
  MemberTerms: string | undefined; // Max 400 chars
  MemberClassPermissionsProvisionLocation: "Bylaw" | "Herein";
  MemberClassPermissions: string | undefined; // Max 400 chars
  TrusteeElectionProcessProvisionLocation: "Bylaw" | "Herein";
  TrusteeElectionProcess: string | undefined; // Max 400 chars
  AssetDistributionProvisionLocation: "Bylaw" | "Herein";
  AssetDistribution: string | undefined; // Max 400 chars
};

type AdditionalProvisions = {
  AdditionalProvisions: AdditionalProvision[];
};

export type OtherProvisions = {
  OtherProvisions: AdditionalProvision[];
};

type Provisions = {
  AdditionalLimitedLiabilityCompany?: OtherProvisions;
  AdditionalLimitedLiabilityPartnership?: OtherProvisions;
  AdditionalCCorpOrProfessionalCorp?: AdditionalProvisions;
  AdditionalForeignLimitedPartnership?: AdditionalForeignLimitedPartnershipProvision;
  AdditionalLimitedPartnership?: AdditionalLimitedPartnershipProvision;
  AdditionalDomesticNonProfitCorp?: AdditionalDomesticNonProfitCorp;
};

export interface Formation extends Provisions {
  Gov2GoAnnualReports: boolean; //This will dictate if the Payer’s email will be subscribed to G2G Annual Reports
  Gov2GoCorpWatch: boolean; //This will dictate if the Payer’s email will be subscribed to G2G Corpwatch
  ShortGoodStanding: boolean; //Option to order Good Standing Certificate
  Certified: boolean; //Option to order Certified Copy of the Formation
  PayerEmail: string;
  SelectPaymentType: "ACH" | "CC"; //Method user wishes to use to pay. Valid Values: ACH, CC
  BusinessInformation: {
    CompanyOrigin: "Domestic" | "Foreign"; //Domestic if from Jersey. Valid Types: Domestic, Foreign
    Business: BusinessType; //Business Type (DomesticLimitedLiabilityCompany)
    BusinessName: string; //The requested business name, must be available and not contain any restricted words. Name plus designator length must be less than 100 characters in length.
    BusinessDesignator: BusinessSuffix; //The designator - LLC. L.L.C etc
    PracticesLaw: "Yes" | "No" | undefined;
    Naic: string; // If supplied must be 6 digits
    BusinessPurpose: string | undefined; // Max 300 chars
    EffectiveFilingDate: string; // date mm/dd/yyyy
    MainAddress: ApiLocation;
    TotalShares: number | undefined;
    ForeignStateOfFormation: StateNames | undefined;
    ForeignDateOfFormation: string | undefined; // date mm/dd/yyyy
  };
  CompanyProfit: "Profit" | "NonProfit";
  RegisteredAgent: {
    Id: string | undefined; // 7 max, must be valid NJ registered agent number
    Email: string | undefined; //50 max, must be email address
    Name: string | undefined; // 50 max, required if no ID
    Location: ApiLocation | undefined; // required if no ID
  };
  MemberAttestation: boolean | undefined;
  Incorporators: MembersObjects[] | undefined;
  Members: MembersObjects[] | undefined;
  Signers: Array<{
    //This can be a list/array of items. Maximum 10
    Name: string; // max 50
    Title: SignerTitle;
    Signed: boolean;
  }>;
  ContactFirstName: string; //Contact person for filing
  ContactLastName: string;
  ContactPhoneNumber: string;
  ContactEmail: string;
}

export interface ApiSubmission {
  Account: string; //API User Account id
  Key: string; //API Account Key
  ReturnUrl: string;
  FailureReturnUrl: string;
  Payer: {
    FirstName?: string; // string (combined with LastName total 49), if not set will use ContactFirstName
    LastName?: string; // string (combined with FirstName total 49), if not set will use ContactLastName
    CompanyName: string;
    Address1: string;
    Address2: string;
    City: string;
    StateAbbreviation?: StateShortCodes; // 2 chars
    ZipCode?: string; // 5 chars
    PhoneNumber?: string; // 12 chars, if not set ContactPhoneNumber will be used
    Email?: string;
  };
  Formation: Formation;
  ForeignGoodStandingFile?: {
    Extension: string;
    Content: string;
  };
}

type MembersObjects = {
  Name: string; // 50 max
  Location: ApiLocation;
};

type AdditionalProvision = {
  Provision: string; // max 400 chars
};

type ApiLocation = {
  Address1: string; // 35 char max, Can not be left blank, if any other address field has data
  Address2: string; // max 35 char
  City: string; // 30 char max, Can not be left blank, if any other address field has data
  State: StateNames | undefined; // required if country = US. Must be full state name. Ex: Alabama
  Province?: string;
  Zipcode: string; // max 5 if country=US, 11 otherwise
  Country: CountriesShortCodes | undefined; //alpha-2 iban code
};

type BusinessType =
  | "DomesticLimitedLiabilityCompany"
  | "DomesticLimitedLiabilityPartnership"
  | "DomesticForProfitCorporation"
  | "DomesticNonProfitCorporation"
  | "DomesticNonProfitVeteranCorporation"
  | "ForeignNonProfitCorporation"
  | "DomesticLimitedPartnership"
  | "ForeignForProfitCorporation"
  | "ForeignLimitedLiabilityCompany"
  | "ForeignLimitedPartnership"
  | "ForeignLimitedLiabilityPartnership";

type FormationFields = {
  businessType: BusinessType;
  shortDescription: "LLC" | "LLP" | "LP" | "DP" | "NP" | "NV" | "NF" | "LF" | "LFC" | "FLC" | "FLP" | "FR";
};

const BusinessTypeMap: Record<FormationLegalType | "veteran-nonprofit", FormationFields> = {
  "limited-liability-company": {
    businessType: "DomesticLimitedLiabilityCompany",
    shortDescription: "LLC",
  },
  "limited-liability-partnership": {
    businessType: "DomesticLimitedLiabilityPartnership",
    shortDescription: "LLP",
  },
  "limited-partnership": {
    businessType: "DomesticLimitedPartnership",
    shortDescription: "LP",
  },
  "c-corporation": {
    businessType: "DomesticForProfitCorporation",
    shortDescription: "DP",
  },
  "s-corporation": {
    businessType: "DomesticForProfitCorporation",
    shortDescription: "DP",
  },
  nonprofit: {
    businessType: "DomesticNonProfitCorporation",
    shortDescription: "NP",
  },
  "veteran-nonprofit": {
    businessType: "DomesticNonProfitVeteranCorporation",
    shortDescription: "NV",
  },
  "foreign-nonprofit": {
    businessType: "ForeignNonProfitCorporation",
    shortDescription: "NF",
  },
  "foreign-limited-partnership": {
    businessType: "ForeignLimitedPartnership",
    shortDescription: "LF",
  },
  "foreign-limited-liability-company": {
    businessType: "ForeignLimitedLiabilityCompany",
    shortDescription: "FLC",
  },
  "foreign-limited-liability-partnership": {
    businessType: "ForeignLimitedLiabilityPartnership",
    shortDescription: "FLP",
  },
  "foreign-c-corporation": {
    businessType: "ForeignForProfitCorporation",
    shortDescription: "FR",
  },
  "foreign-s-corporation": {
    businessType: "ForeignForProfitCorporation",
    shortDescription: "FR",
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
