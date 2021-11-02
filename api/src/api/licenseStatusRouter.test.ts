/* eslint-disable @typescript-eslint/no-unused-vars */

import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { licenseStatusRouterFactory } from "./licenseStatusRouter";
import {
  generateLicenseData,
  generateLicenseStatusItem,
  generateNameAndAddress,
  generateUserData,
} from "../../test/factories";
import { getSignedInUserId } from "./userRouter";

jest.mock("./userRouter", () => ({
  getSignedInUserId: jest.fn(),
}));
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("licenseStatusRouter", () => {
  let app: Express;

  let stubUpdateLicenseStatus: jest.Mock;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");
    stubUpdateLicenseStatus = jest.fn();
    app = express();
    app.use(bodyParser.json());
    app.use(licenseStatusRouterFactory(stubUpdateLicenseStatus));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns user data with updated license status", async () => {
    const licenseData = generateLicenseData({
      items: [generateLicenseStatusItem({})],
      status: "PENDING",
    });
    const userData = generateUserData({ licenseData });
    stubUpdateLicenseStatus.mockResolvedValue(userData);

    const nameAndAddress = generateNameAndAddress({});

    const response = await request(app).post(`/license-status`).send(nameAndAddress);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(userData);
    expect(stubUpdateLicenseStatus).toHaveBeenCalledWith("some-id", nameAndAddress);
  });

  it("returns 404 if license status is unknown", async () => {
    const licenseData = generateLicenseData({
      items: [],
      status: "UNKNOWN",
    });
    const userData = generateUserData({ licenseData });
    stubUpdateLicenseStatus.mockResolvedValue(userData);

    const response = await request(app).post(`/license-status`).send(generateNameAndAddress({}));
    expect(response.status).toEqual(404);
  });

  it("returns 500 if license search errors", async () => {
    stubUpdateLicenseStatus.mockRejectedValue({});
    const response = await request(app).post(`/license-status`).send(generateNameAndAddress({}));
    expect(response.status).toEqual(500);
  });
});
