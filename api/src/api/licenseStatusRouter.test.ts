import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { LicenseStatusItem } from "../domain/types";
import { licenseStatusRouterFactory } from "./licenseStatusRouter";
import {
  generateLicenseSearchCriteria,
  generateLicenseStatusItem,
  generateNameAndAddress,
} from "../domain/factories";

describe("licenseStatusRouter", () => {
  let app: Express;

  let stubSearchLicenseStatus: jest.Mock;

  beforeEach(async () => {
    stubSearchLicenseStatus = jest.fn();
    app = express();
    app.use(bodyParser.json());
    app.use(licenseStatusRouterFactory(stubSearchLicenseStatus));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns the status of each license item", async () => {
    const result: LicenseStatusItem[] = [generateLicenseStatusItem({})];
    stubSearchLicenseStatus.mockResolvedValue(result);

    const searchCriteria = generateLicenseSearchCriteria({});

    const response = await request(app).post(`/license-status`).send(searchCriteria);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(result);
    expect(stubSearchLicenseStatus).toHaveBeenCalledWith(searchCriteria);
  });

  it("returns 500 if license search errors", async () => {
    stubSearchLicenseStatus.mockRejectedValue({});
    const response = await request(app).post(`/license-status`).send(generateNameAndAddress({}));
    expect(response.status).toEqual(500);
  });
});
