/* eslint-disable @typescript-eslint/no-unused-vars */
import { licenseStatusRouterFactory } from "@api/licenseStatusRouter";
import { getSignedInUserId } from "@api/userRouter";
import { setupExpress } from "@libs/express";
import { DummyLogWriter } from "@libs/logWriter";
import {
  generateBusiness,
  generateLicenseData,
  generateLicenseSearchNameAndAddress,
  generateUserDataForBusiness,
} from "@shared/test";
import { Express } from "express";
import { StatusCodes } from "http-status-codes";
import { DatabaseClient } from "src/domain/types";
import request from "supertest";

jest.mock("@api/userRouter", () => {
  return {
    getSignedInUserId: jest.fn(),
  };
});
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("licenseStatusRouter", () => {
  let app: Express;

  let stubUpdateLicenseStatus: jest.Mock;

  let stubDynamoDataClient: jest.Mocked<DatabaseClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
    stubUpdateLicenseStatus = jest.fn();
    stubDynamoDataClient = {
      migrateOutdatedVersionUsers: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      findByEmail: jest.fn(),
      findUserByBusinessName: jest.fn(),
      findUsersByBusinessNamePrefix: jest.fn(),
      findBusinessesByHashedTaxId: jest.fn(),
    };
    stubDynamoDataClient.put.mockImplementation((userData) => {
      return Promise.resolve(userData);
    });
    app = setupExpress(false);
    app.use(
      licenseStatusRouterFactory(stubUpdateLicenseStatus, stubDynamoDataClient, DummyLogWriter),
    );
  });

  afterAll(async () => {
    await new Promise((resolve) => {
      return setTimeout(resolve, 500);
    });
  });

  it("returns user data when search initiated by user and no license", async () => {
    const licenseData = generateLicenseData({});
    const userData = generateUserDataForBusiness(generateBusiness({ licenseData }));
    stubUpdateLicenseStatus.mockResolvedValue(userData);

    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    stubDynamoDataClient.get.mockResolvedValue(userData);
    const response = await request(app).post(`/license-status`).send({ nameAndAddress });
    expect(response.status).toEqual(StatusCodes.OK);
    expect(stubDynamoDataClient.put).toHaveBeenCalledWith(userData);
    expect(response.body).toEqual(userData);
    expect(stubUpdateLicenseStatus).toHaveBeenCalledWith(userData, nameAndAddress);
  });

  it("returns INTERNAL SERVER ERROR if license search errors", async () => {
    stubUpdateLicenseStatus.mockRejectedValue({});
    const response = await request(app)
      .post(`/license-status`)
      .send({ nameAndAddress: generateLicenseSearchNameAndAddress({}) });
    expect(stubDynamoDataClient.put).not.toHaveBeenCalled();
    expect(response.status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("returns an empty object when update license status returns an empty object", async () => {
    const nameAndAddress = generateLicenseSearchNameAndAddress({});
    stubUpdateLicenseStatus.mockResolvedValue({});
    const response = await request(app)
      .post(`/license-status`)
      .send({ nameAndAddress: nameAndAddress });
    expect(response.status).toEqual(StatusCodes.OK);
    expect(response.body).toEqual({});
  });
});
