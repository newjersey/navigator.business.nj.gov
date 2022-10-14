import { getCurrentDateISOString, parseDateWithFormat } from "@shared/dateHelpers";
import axios from "axios";
import {
  generateFormationAddress,
  generateFormationData,
  generateFormationFormData,
  generateFormationUserData,
  generateProfileData,
  generateUserData,
} from "../../test/factories";
import { FormationClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import {
  ApiError,
  ApiFormationClient,
  ApiGetFilingResponse,
  ApiResponse,
  ApiSubmission,
} from "./ApiFormationClient";

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

const generateApiResponse = (overrides: Partial<ApiResponse>): ApiResponse => {
  return {
    Success: true,
    Id: `some-id-${Math.random()}`,
    PayUrl: {
      PortalPayId: `some-pay-id-${Math.random()}`,
      RedirectToUrl: `some-redirect-url-${Math.random()}`,
      StatusCode: 1,
    },
    ...overrides,
  };
};

const generateApiError = (overrides: Partial<ApiError>): ApiError => {
  return {
    Valid: false,
    ErrorMessage: `some-error-message-${Math.random()}`,
    Name: `some-error-name-${Math.random()}`,
    ...overrides,
  };
};

const stubGenerateApiResponse = (overrides: Partial<ApiGetFilingResponse>): ApiGetFilingResponse => {
  return {
    Success: true,
    BusinessName: `some-BusinessName-${Math.random()}`,
    EntityId: `some-EntityId-${Math.random()}`,
    TransactionDate: getCurrentDateISOString(),
    ConfirmationNumber: `some-ConfirmationNumber-${Math.random()}`,
    FormationDoc: `some-FormationDoc-${Math.random()}`,
    StandingDoc: `some-StandingDoc-${Math.random()}`,
    CertifiedDoc: `some-CertifiedDoc-${Math.random()}`,
    ...overrides,
  };
};

describe("ApiFormationClient", () => {
  let client: FormationClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "ApiLogs", "us-test-1");
    client = ApiFormationClient(
      { account: "12345", key: "abcdef", baseUrl: "example.com/formation" },
      logger
    );
  });

  describe("form", () => {
    describe("when LLC", () => {
      it("posts to the endpoint with the qapi formation object", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            provisions: ["provision1", "provision2"],
            members: [generateFormationAddress({})],
            signers: [
              generateFormationAddress({
                name: "faraz",
                signature: true,
              }),
              generateFormationAddress({
                name: "anne",
                signature: true,
              }),
              generateFormationAddress({
                name: "mike",
                signature: false,
              }),
            ],
          },
          "limited-liability-company"
        );

        const userData = generateFormationUserData(
          { legalStructureId: "limited-liability-company" },
          {},
          formationFormData
        );

        await client.form(userData, "navigator.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/PrepareFiling", {
          Account: "12345",
          Key: "abcdef",
          ReturnUrl: "navigator.com/form-business?completeFiling=true",
          FailureReturnUrl: "navigator.com/form-business?completeFiling=false",
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
              Business: "DomesticLimitedLiabilityCompany",
              BusinessName: formationFormData.businessName,
              BusinessDesignator: formationFormData.businessSuffix,
              Naic: userData.profileData.naicsCode,
              BusinessPurpose: formationFormData.businessPurpose,
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
            AdditionalLimitedLiabilityCompany: {
              OtherProvisions: [{ Provision: "provision1" }, { Provision: "provision2" }],
            },
            CompanyProfit: "Profit",
            RegisteredAgent: {
              Id: undefined,
              Email: formationFormData.agentEmail,
              Name: formationFormData.agentName,
              Location: {
                Address1: formationFormData.agentOfficeAddressLine1,
                Address2: formationFormData.agentOfficeAddressLine2,
                City: formationFormData.agentOfficeAddressCity,
                State: "New Jersey",
                Zipcode: formationFormData.agentOfficeAddressZipCode,
                Country: "US",
              },
            },
            Members: [
              {
                Name: formationFormData.members[0].name,
                Location: {
                  Address1: formationFormData.members[0].addressLine1,
                  Address2: formationFormData.members[0].addressLine2,
                  City: formationFormData.members[0].addressCity,
                  State: formationFormData.members[0].addressState,
                  Zipcode: formationFormData.members[0].addressZipCode,
                  Country: "US",
                },
              },
            ],
            Signers: [
              {
                Name: "faraz",
                Title: "Authorized Representative",
                Signed: true,
              },
              {
                Name: "anne",
                Title: "Authorized Representative",
                Signed: true,
              },
              {
                Name: "mike",
                Title: "Authorized Representative",
                Signed: false,
              },
            ],
            ContactFirstName: formationFormData.contactFirstName,
            ContactLastName: formationFormData.contactLastName,
            ContactPhoneNumber: formationFormData.contactPhoneNumber,
          },
        });
      });
    });

    describe("when CORP", () => {
      it("posts to the endpoint with the api formation object", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            businessTotalStock: "1234",
            agentNumberOrManual: "MANUAL_ENTRY",
            provisions: ["provision1", "provision2"],
            members: [generateFormationAddress({})],
            signers: [
              generateFormationAddress({ name: "faraz", signature: true }),
              generateFormationAddress({ name: "anne", signature: false }),
            ],
          },
          "s-corporation"
        );

        const userData = generateFormationUserData(
          { legalStructureId: "s-corporation" },
          {},
          formationFormData
        );

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/PrepareFiling", {
          Account: "12345",
          Key: "abcdef",
          ReturnUrl: "hostname.com/form-business?completeFiling=true",
          FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
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
              Business: "DomesticForProfitCorporation",
              BusinessName: formationFormData.businessName,
              BusinessDesignator: formationFormData.businessSuffix,
              Naic: userData.profileData.naicsCode,
              TotalShares: 1234,
              BusinessPurpose: formationFormData.businessPurpose,
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
            AdditionalCCorpOrProfessionalCorp: {
              AdditionalProvisions: [{ Provision: "provision1" }, { Provision: "provision2" }],
            },
            CompanyProfit: "Profit",
            MemberAttestation: true,
            RegisteredAgent: {
              Id: undefined,
              Email: formationFormData.agentEmail,
              Name: formationFormData.agentName,
              Location: {
                Address1: formationFormData.agentOfficeAddressLine1,
                Address2: formationFormData.agentOfficeAddressLine2,
                City: formationFormData.agentOfficeAddressCity,
                State: "New Jersey",
                Zipcode: formationFormData.agentOfficeAddressZipCode,
                Country: "US",
              },
            },
            Members: [
              {
                Name: formationFormData.members[0].name,
                Location: {
                  Address1: formationFormData.members[0].addressLine1,
                  Address2: formationFormData.members[0].addressLine2,
                  City: formationFormData.members[0].addressCity,
                  State: formationFormData.members[0].addressState,
                  Zipcode: formationFormData.members[0].addressZipCode,
                  Country: "US",
                },
              },
            ],
            Incorporators: [
              {
                Name: "faraz",
                Location: {
                  Address1: formationFormData.signers[0].addressLine1,
                  Address2: formationFormData.signers[0].addressLine2,
                  City: formationFormData.signers[0].addressCity,
                  State: formationFormData.signers[0].addressState,
                  Zipcode: formationFormData.signers[0].addressZipCode,
                  Country: "US",
                },
              },
              {
                Name: "anne",
                Location: {
                  Address1: formationFormData.signers[1].addressLine1,
                  Address2: formationFormData.signers[1].addressLine2,
                  City: formationFormData.signers[1].addressCity,
                  State: formationFormData.signers[1].addressState,
                  Zipcode: formationFormData.signers[1].addressZipCode,
                  Country: "US",
                },
              },
            ],
            Signers: [
              {
                Name: "faraz",
                Title: "Incorporator",
                Signed: true,
              },
              {
                Name: "anne",
                Title: "Incorporator",
                Signed: false,
              },
            ],
            ContactFirstName: formationFormData.contactFirstName,
            ContactLastName: formationFormData.contactLastName,
            ContactPhoneNumber: formationFormData.contactPhoneNumber,
          },
        });
      });
    });

    describe("when LLP", () => {
      it("posts to the endpoint with the api formation object", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            provisions: ["provision1", "provision2"],
            members: [],
            signers: [
              generateFormationAddress({
                name: "faraz",
                signature: true,
              }),
              generateFormationAddress({
                name: "anne",
                signature: true,
              }),
              generateFormationAddress({
                name: "mike",
                signature: false,
              }),
            ],
          },
          "limited-liability-partnership"
        );

        const userData = generateUserData({
          profileData: generateProfileData({ legalStructureId: "limited-liability-partnership" }),
          formationData: generateFormationData({ formationFormData }),
        });

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/PrepareFiling", {
          Account: "12345",
          Key: "abcdef",
          ReturnUrl: "hostname.com/form-business?completeFiling=true",
          FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
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
              Business: "DomesticLimitedLiabilityPartnership",
              BusinessName: formationFormData.businessName,
              BusinessDesignator: formationFormData.businessSuffix,
              Naic: userData.profileData.naicsCode,
              BusinessPurpose: formationFormData.businessPurpose,
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
            AdditionalLimitedLiabilityPartnership: {
              OtherProvisions: [{ Provision: "provision1" }, { Provision: "provision2" }],
            },
            CompanyProfit: "Profit",
            RegisteredAgent: {
              Id: undefined,
              Email: formationFormData.agentEmail,
              Name: formationFormData.agentName,
              Location: {
                Address1: formationFormData.agentOfficeAddressLine1,
                Address2: formationFormData.agentOfficeAddressLine2,
                City: formationFormData.agentOfficeAddressCity,
                State: "New Jersey",
                Zipcode: formationFormData.agentOfficeAddressZipCode,
                Country: "US",
              },
            },
            Members: [],
            Signers: [
              {
                Name: "faraz",
                Title: "Authorized Partner",
                Signed: true,
              },
              {
                Name: "anne",
                Title: "Authorized Partner",
                Signed: true,
              },
              {
                Name: "mike",
                Title: "Authorized Partner",
                Signed: false,
              },
            ],
            ContactFirstName: formationFormData.contactFirstName,
            ContactLastName: formationFormData.contactLastName,
            ContactPhoneNumber: formationFormData.contactPhoneNumber,
          },
        });
      });
    });

    describe("when LP", () => {
      it("posts to the endpoint with the api formation object", async () => {
        const stubResponse = generateApiResponse({});
        mockAxios.post.mockResolvedValue({ data: stubResponse });

        const formationFormData = generateFormationFormData(
          {
            agentNumberOrManual: "MANUAL_ENTRY",
            provisions: [],
            members: [generateFormationAddress({})],
            withdrawals: "withdrawl",
            dissolution: "dissolution",
            combinedInvestment: "combined investment",
            canCreateLimitedPartner: true,
            createLimitedPartnerTerms: "partner terms",
            canGetDistribution: true,
            getDistributionTerms: "get distro terms",
            canMakeDistribution: false,
            makeDistributionTerms: "make distro terms",
            signers: [
              generateFormationAddress({
                name: "faraz",
                signature: true,
              }),
              generateFormationAddress({
                name: "anne",
                signature: true,
              }),
              generateFormationAddress({
                name: "mike",
                signature: false,
              }),
            ],
          },
          "limited-partnership"
        );

        const userData = generateUserData({
          profileData: generateProfileData({ legalStructureId: "limited-partnership" }),
          formationData: generateFormationData({ formationFormData }),
        });

        await client.form(userData, "hostname.com/form-business");

        expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/PrepareFiling", {
          Account: "12345",
          Key: "abcdef",
          ReturnUrl: "hostname.com/form-business?completeFiling=true",
          FailureReturnUrl: "hostname.com/form-business?completeFiling=false",
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
              Business: "DomesticLimitedPartnership",
              BusinessName: formationFormData.businessName,
              BusinessDesignator: formationFormData.businessSuffix,
              Naic: userData.profileData.naicsCode,
              BusinessPurpose: formationFormData.businessPurpose,
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
            AdditionalLimitedPartnership: {
              AdditionalProvisions: [],
              AggregateAmount: "combined investment",
              DissolutionPlan: "dissolution",
              GeneralPartnerWithdrawal: "withdrawl",
              LimitedCanCreateLimited: "Yes",
              LimitedCanCreateLimitedTerms: "partner terms",
              LimitedCanGetDistribution: "Yes",
              LimitedCanGetDistributionTerms: "get distro terms",
              LimitedCanMakeDistribution: "No",
              LimitedCanMakeDistributionTerms: "make distro terms",
            },
            CompanyProfit: "Profit",
            RegisteredAgent: {
              Id: undefined,
              Email: formationFormData.agentEmail,
              Name: formationFormData.agentName,
              Location: {
                Address1: formationFormData.agentOfficeAddressLine1,
                Address2: formationFormData.agentOfficeAddressLine2,
                City: formationFormData.agentOfficeAddressCity,
                State: "New Jersey",
                Zipcode: formationFormData.agentOfficeAddressZipCode,
                Country: "US",
              },
            },
            Members: [
              {
                Name: formationFormData.members[0].name,
                Location: {
                  Address1: formationFormData.members[0].addressLine1,
                  Address2: formationFormData.members[0].addressLine2,
                  City: formationFormData.members[0].addressCity,
                  State: formationFormData.members[0].addressState,
                  Zipcode: formationFormData.members[0].addressZipCode,
                  Country: "US",
                },
              },
            ],
            Signers: [
              {
                Name: "faraz",
                Title: "General Partner",
                Signed: true,
              },
              {
                Name: "anne",
                Title: "General Partner",
                Signed: true,
              },
              {
                Name: "mike",
                Title: "General Partner",
                Signed: false,
              },
            ],
            ContactFirstName: formationFormData.contactFirstName,
            ContactLastName: formationFormData.contactLastName,
            ContactPhoneNumber: formationFormData.contactPhoneNumber,
          },
        });
      });
    });

    it("fills only registered agent number when NUMBER is selected", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, { agentNumberOrManual: "NUMBER" });

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.RegisteredAgent.Id).toEqual(
        userData.formationData.formationFormData.agentNumber
      );
      expect(postBody.Formation.RegisteredAgent.Email).toEqual(undefined);
      expect(postBody.Formation.RegisteredAgent.Name).toEqual(undefined);
      expect(postBody.Formation.RegisteredAgent.Location).toEqual(undefined);
    });

    it("sends with empty NAICS code if profile data NAICS is not 6 digits", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData(
        { naicsCode: "12345" },
        {},
        { agentNumberOrManual: "NUMBER" }
      );

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.BusinessInformation.Naic).toEqual("");
    });

    it("does not send business purpose if it is empty", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, { businessPurpose: "" });

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.BusinessInformation.BusinessPurpose).toBeUndefined();
    });

    it("does not send AdditionalLimitedLiabilityCompany if provisions is empty", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, { provisions: [] });

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.AdditionalLimitedLiabilityCompany).toBeUndefined();
    });

    it("responds with success, token, and redirect url", async () => {
      const stubResponse = generateApiResponse({ Success: true });
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateFormationUserData({}, {}, {});

      expect(await client.form(userData, "some-url")).toEqual({
        success: stubResponse.Success,
        token: stubResponse.PayUrl.PortalPayId,
        formationId: stubResponse.Id,
        redirect: stubResponse.PayUrl.RedirectToUrl,
        errors: [],
      });
    });

    it("responds with error messages when failure", async () => {
      const stubError1 = generateApiError({ Name: "Formation.PayerEmail" });
      const stubError2 = generateApiError({ Name: "Formation.RegisteredAgent" });
      mockAxios.post.mockResolvedValue({ data: [stubError1, stubError2] });

      const userData = generateFormationUserData({}, {}, {});

      expect(await client.form(userData, "some-url")).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [
          { field: "Payer Email", message: stubError1.ErrorMessage, type: "FIELD" },
          { field: "Registered Agent", message: stubError2.ErrorMessage, type: "FIELD" },
        ],
      });
    });

    it("responds with generic response error when un-parseable failure", async () => {
      mockAxios.post.mockResolvedValue({
        data: "Unexpected error: An error occurred while updating the entries.",
      });

      const userData = generateFormationUserData({}, {}, {});

      expect(await client.form(userData, "some-url")).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [{ field: "", message: "Response Error", type: "RESPONSE" }],
      });
    });

    it("responds with generic error message when connection error", async () => {
      mockAxios.post.mockRejectedValue({});
      const userData = generateFormationUserData({}, {}, {});

      expect(await client.form(userData, "some-url")).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [{ field: "", message: "Unknown Error", type: "UNKNOWN" }],
      });
    });
  });

  describe("getCompletedFiling", () => {
    it("posts to the endpoint with formationId token", async () => {
      const stubResponse = stubGenerateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const response = await client.getCompletedFiling("formation-id-123");

      expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/GetCompletedFiling", {
        Account: "12345",
        Key: "abcdef",
        FormationId: "formation-id-123",
      });

      expect(response).toEqual({
        success: stubResponse.Success,
        entityId: stubResponse.EntityId,
        transactionDate: stubResponse.TransactionDate,
        confirmationNumber: stubResponse.ConfirmationNumber,
        formationDoc: stubResponse.FormationDoc,
        standingDoc: stubResponse.StandingDoc,
        certifiedDoc: stubResponse.CertifiedDoc,
      });
    });
  });
});
