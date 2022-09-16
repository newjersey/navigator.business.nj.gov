/* eslint-disable @typescript-eslint/no-unused-vars */
import { Express } from "express";
import request from "supertest";
import { generateTaxIdAndBusinessName, generateUserData } from "../../test/factories";
import { TaxFilingClient, UserDataClient } from "../domain/types";
import { setupExpress } from "../libs/express";
import { taxFilingRouterFactory } from "./taxFilingRouter";
import { getSignedInUserId } from "./userRouter";

jest.mock("./userRouter", () => ({
  getSignedInUserId: jest.fn(),
}));
const fakeSignedInUserId = getSignedInUserId as jest.Mock;

describe("taxFilingRouter", () => {
  let app: Express;

  let stubUserDataClient: jest.Mocked<UserDataClient>;
  let apiTaxFilingClient: jest.Mocked<TaxFilingClient>;

  beforeEach(async () => {
    jest.resetAllMocks();
    fakeSignedInUserId.mockReturnValue("some-id");

    stubUserDataClient = {
      get: jest.fn(),
      findByEmail: jest.fn(),
      put: jest.fn(),
    };

    apiTaxFilingClient = {
      lookup: jest.fn(),
      onboarding: jest.fn(),
    };

    stubUserDataClient.put.mockImplementation((userData) => Promise.resolve(userData));
    app = setupExpress(false);
    app.use(taxFilingRouterFactory(stubUserDataClient, apiTaxFilingClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns userData on /lookup", async () => {
    const userData = generateUserData({});
    apiTaxFilingClient.lookup.mockResolvedValue(userData);
    const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
    const response = await request(app).post(`/lookup`).send(taxIdAndBusinessName);
    expect(response.body).toEqual(userData);
    expect(apiTaxFilingClient.lookup).toHaveBeenCalledWith({ userId: "some-id", ...taxIdAndBusinessName });
    expect(response.status).toEqual(200);
  });

  it("returns userData on /onboarding", async () => {
    const userData = generateUserData({});
    apiTaxFilingClient.onboarding.mockResolvedValue(userData);
    const taxIdAndBusinessName = generateTaxIdAndBusinessName({});
    const response = await request(app).post(`/onboarding`).send(taxIdAndBusinessName);
    expect(apiTaxFilingClient.onboarding).toHaveBeenCalledWith({
      userId: "some-id",
      ...taxIdAndBusinessName,
    });
    expect(response.status).toEqual(200);
  });
});
