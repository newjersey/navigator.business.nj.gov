import { crtkLookupRouterFactory } from "@api/crtkRouter";
import { getSignedInUserId } from "@api/userRouter";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import type { CRTKBusinessDetails } from "@shared/crtk";
import { generateBusiness, generateUserDataForBusiness } from "@shared/test";
import type { Express } from "express";
import { StatusCodes } from "http-status-codes";
import type { DatabaseClient } from "src/domain/types";
import request from "supertest";

jest.mock("@api/userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("crtkLookupRouter", () => {
  let app: Express;

  let stubUpdateCRTKUser: jest.Mock;

  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
    stubUpdateCRTKUser = jest.fn();
    stubDynamoDataClient = {
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      migrateOutdatedVersionUsers: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };
    stubDynamoDataClient.put.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    app = setupExpress(false);
    app.use(crtkLookupRouterFactory(stubUpdateCRTKUser, stubDynamoDataClient, DummyLogWriter));
    jest.spyOn(DummyLogWriter, "LogInfo").mockImplementation(() => {});
    jest.spyOn(DummyLogWriter, "LogError").mockImplementation(() => {});
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  it("returns updated userData and updates db when CRTK lookup is successful", async () => {
    const CRTKbusinessDetails: CRTKBusinessDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      city: "Newark",
      addressZipCode: "07102",
      ein: "123456789",
    };

    const userData = generateUserDataForBusiness(
      generateBusiness({
        crtkData: {
          lastUpdatedISO: new Date().toISOString(),
          CRTKBusinessDetails: CRTKbusinessDetails,
          CRTKSearchResult: "FOUND",
          CRTKEntry: {
            businessName: "Some Business LLC",
            streetAddress: "123 Main Street",
            city: "Newark",
            state: "NJ",
            zipCode: "07102",
            ein: "123456789",
            facilityId: "FAC123",
          },
        },
      }),
    );

    stubUpdateCRTKUser.mockResolvedValue(userData);

    const response = await request(app).post(`/crtk-lookup`).send({
      CRTKbusinessDetails,
    });
    expect(stubDynamoDataClient.put).toHaveBeenCalledWith(userData);
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual(userData);
    expect(DummyLogWriter.LogInfo).toHaveBeenCalledWith(
      expect.stringContaining("successfully completed CRTK lookup"),
    );
  });

  it("returns INTERNAL SERVER ERROR when CRTK lookup fails", async () => {
    stubUpdateCRTKUser.mockRejectedValue(new Error("CRTK service unavailable"));
    const CRTKbusinessDetails: CRTKBusinessDetails = {
      businessName: "Some Business LLC",
      addressLine1: "123 Main Street",
      city: "Newark",
      addressZipCode: "07102",
    };
    const response = await request(app).post(`/crtk-lookup`).send({
      CRTKbusinessDetails,
    });
    expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
    expect(DummyLogWriter.LogError).toHaveBeenCalledWith(
      expect.stringContaining("Failed CRTK lookup:"),
    );
  });
});
