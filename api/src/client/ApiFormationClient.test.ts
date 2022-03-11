import axios from "axios";
import {
  generateFormationData,
  generateFormationFormData,
  generateFormationMember,
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
import dayjs = require("dayjs");

jest.mock("axios");
jest.mock("winston");
const mockAxios = axios as jest.Mocked<typeof axios>;

describe("ApiFormationClient", () => {
  let client: FormationClient;
  let logger: LogWriterType;

  beforeEach(() => {
    jest.resetAllMocks();
    logger = LogWriter("NavigatorWebService", "SearchApis", "us-test-1");
    client = ApiFormationClient(
      { account: "12345", key: "abcdef", baseUrl: "example.com/formation" },
      logger
    );
  });

  describe("form", () => {
    it("posts to the endpoint with the api formation object", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const formationFormData = generateFormationFormData({
        agentNumberOrManual: "MANUAL_ENTRY",
        signer: "faraz",
        members: [generateFormationMember({})],
        additionalSigners: ["anne", "mike"],
      });

      const userData = generateUserData({
        formationData: generateFormationData({ formationFormData }),
      });

      await client.form(userData, "hostname.com/form-business");

      expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation/PrepareFiling", {
        Account: "12345",
        Key: "abcdef",
        ReturnUrl: "hostname.com/form-business?completeFiling=true",
        Payer: {
          CompanyName: userData.profileData.businessName,
          Address1: formationFormData.businessAddressLine1,
          Address2: formationFormData.businessAddressLine2,
          City: userData.profileData.municipality?.name,
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
            Id: null,
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
              Signed: true,
            },
          ],
          ContactFirstName: formationFormData.contactFirstName,
          ContactLastName: formationFormData.contactLastName,
          ContactPhoneNumber: formationFormData.contactPhoneNumber,
        },
      });
    });

    it("fills only registered agent number when NUMBER is selected", async () => {
      const stubResponse = generateApiResponse({});
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const formationFormData = generateFormationFormData({
        agentNumberOrManual: "NUMBER",
      });

      const userData = generateUserData({
        formationData: generateFormationData({ formationFormData }),
      });

      await client.form(userData, "some-url");
      const postBody: ApiSubmission = mockAxios.post.mock.calls[0][1] as ApiSubmission;
      expect(postBody.Formation.RegisteredAgent.Id).toEqual(formationFormData.agentNumber);
      expect(postBody.Formation.RegisteredAgent.Email).toEqual(null);
      expect(postBody.Formation.RegisteredAgent.Name).toEqual(null);
      expect(postBody.Formation.RegisteredAgent.Location).toEqual(null);
    });

    it("responds with success, token, and redirect url", async () => {
      const stubResponse = generateApiResponse({ Success: true });
      mockAxios.post.mockResolvedValue({ data: stubResponse });

      const userData = generateUserData({});

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

      const userData = generateUserData({});

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

      const userData = generateUserData({});

      expect(await client.form(userData, "some-url")).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [{ field: "", message: "Response Error", type: "RESPONSE" }],
      });
    });

    it("responds with generic error message when connection error", async () => {
      mockAxios.post.mockRejectedValue({});
      const userData = generateUserData({});

      expect(await client.form(userData, "some-url")).toEqual({
        success: false,
        token: undefined,
        redirect: undefined,
        errors: [{ field: "", message: "Unknown Error", type: "UNKNOWN" }],
      });
    });

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
  });

  describe("getCompletedFiling", () => {
    it("posts to the endpoint with formationId token", async () => {
      const stubResponse = generateApiResponse({});
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

    const generateApiResponse = (overrides: Partial<ApiGetFilingResponse>): ApiGetFilingResponse => {
      return {
        Success: true,
        BusinessName: `some-BusinessName-${Math.random()}`,
        EntityId: `some-EntityId-${Math.random()}`,
        TransactionDate: dayjs().toISOString(),
        ConfirmationNumber: `some-ConfirmationNumber-${Math.random()}`,
        FormationDoc: `some-FormationDoc-${Math.random()}`,
        StandingDoc: `some-StandingDoc-${Math.random()}`,
        CertifiedDoc: `some-CertifiedDoc-${Math.random()}`,
        ...overrides,
      };
    };
  });
});
