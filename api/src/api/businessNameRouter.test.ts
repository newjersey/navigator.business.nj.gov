import bodyParser from "body-parser";
import express, { Express } from "express";
import request from "supertest";
import { BusinessNameClient, NameAvailability } from "../domain/types";
import { businessNameRouterFactory } from "./businessNameRouter";

describe("businessNameRouter", () => {
  let app: Express;

  let stubBusinessNameClient: jest.Mocked<BusinessNameClient>;

  beforeEach(async () => {
    stubBusinessNameClient = { search: jest.fn() };
    app = express();
    app.use(bodyParser.json());
    app.use(businessNameRouterFactory(stubBusinessNameClient));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns the availability status", async () => {
    const result: NameAvailability = {
      status: "AVAILABLE",
      similarNames: [],
    };
    stubBusinessNameClient.search.mockResolvedValue(result);

    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(result);
    expect(stubBusinessNameClient.search).toHaveBeenCalledWith("apple bee's");
  });

  it("returns 400 if name search returns BAD_INPUT", async () => {
    stubBusinessNameClient.search.mockRejectedValue("BAD_INPUT");
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(400);
  });

  it("returns 500 if name search errors", async () => {
    stubBusinessNameClient.search.mockRejectedValue({});
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(500);
  });
});
