import axios from "axios";
import { generateFormationData, generateFormationFormData, generateUserData } from "../../test/factories";
import { FormationClient } from "../domain/types";
import { LogWriter, LogWriterType } from "../libs/logWriter";
import { ApiError, ApiFormationClient, ApiResponse, ApiSubmission } from "./ApiFormationClient";
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

  it("posts to the endpoint with the api formation object", async () => {
    const stubResponse = generateApiResponse({});
    mockAxios.post.mockResolvedValue({ data: stubResponse });

    const formationFormData = generateFormationFormData({
      agentNumberOrManual: "MANUAL_ENTRY",
      signer: "faraz",
      additionalSigners: ["anne", "mike"],
    });

    const userData = generateUserData({
      formationData: generateFormationData({ formationFormData }),
    });

    await client.form(userData);

    expect(mockAxios.post).toHaveBeenCalledWith("example.com/formation", {
      Account: "12345",
      Key: "abcdef",
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
        ContactFirstName: "",
        ContactLastName: "",
        ContactPhoneNumber: "1234567890",
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

    await client.form(userData);
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

    expect(await client.form(userData)).toEqual({
      success: stubResponse.Success,
      token: stubResponse.PayUrl.PortalPayId,
      redirect: stubResponse.PayUrl.RedirectToUrl,
      errors: [],
    });
  });

  it("responds with error messages when failure", async () => {
    const stubError1 = generateApiError({ Name: "Formation.PayerEmail" });
    const stubError2 = generateApiError({ Name: "Formation.RegisteredAgent" });
    mockAxios.post.mockResolvedValue({ data: [stubError1, stubError2] });

    const userData = generateUserData({});

    expect(await client.form(userData)).toEqual({
      success: false,
      token: undefined,
      redirect: undefined,
      errors: [
        { field: "Payer Email", message: stubError1.ErrorMessage },
        { field: "Registered Agent", message: stubError2.ErrorMessage },
      ],
    });
  });

  it("responds with generic error message when connection error", async () => {
    mockAxios.post.mockRejectedValue({});
    const userData = generateUserData({});

    expect(await client.form(userData)).toEqual({
      success: false,
      token: undefined,
      redirect: undefined,
      errors: [{ field: "", message: "Unknown Error" }],
    });
  });
});

export const generateApiResponse = (overrides: Partial<ApiResponse>): ApiResponse => {
  return {
    Success: true,
    PayUrl: {
      PortalPayId: `some-pay-id-${Math.random()}`,
      RedirectToUrl: `some-redirect-url-${Math.random()}`,
      StatusCode: 1,
    },
    ...overrides,
  };
};

export const generateApiError = (overrides: Partial<ApiError>): ApiError => {
  return {
    Valid: false,
    ErrorMessage: `some-error-message-${Math.random()}`,
    Name: `some-error-field-${Math.random()}`,
    ...overrides,
  };
};
