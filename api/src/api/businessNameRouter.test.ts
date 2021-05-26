import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { businessNameRouterFactory } from "./businessNameRouter";
import { NameAvailability } from "../domain/types";

describe("businessNameRouter", () => {
  let app: Express;

  let stubSearchBusinessName: jest.Mock;

  beforeEach(async () => {
    stubSearchBusinessName = jest.fn();
    app = express();
    app.use(bodyParser.json());
    app.use(businessNameRouterFactory(stubSearchBusinessName));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns the availability status", async () => {
    const result: NameAvailability = {
      status: "AVAILABLE",
      similarNames: [],
    };
    stubSearchBusinessName.mockResolvedValue(result);

    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(result);
    expect(stubSearchBusinessName).toHaveBeenCalledWith("apple bee's");
  });

  it("returns 400 if name search returns BAD_INPUT", async () => {
    stubSearchBusinessName.mockRejectedValue("BAD_INPUT");
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(400);
  });

  it("returns 500 if name search errors", async () => {
    stubSearchBusinessName.mockRejectedValue({});
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(500);
  });
});
