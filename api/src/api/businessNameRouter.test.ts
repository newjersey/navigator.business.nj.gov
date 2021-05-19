import request from "supertest";
import express, { Express } from "express";
import bodyParser from "body-parser";
import { BusinessNameRepo } from "../domain/types";
import { businessNameRouterFactory } from "./businessNameRouter";

describe("businessNameRouter", () => {
  let app: Express;

  let stubBusinessNameRepo: jest.Mocked<BusinessNameRepo>;

  beforeEach(async () => {
    stubBusinessNameRepo = {
      search: jest.fn(),
      save: jest.fn(),
      deleteAll: jest.fn(),
      disconnect: jest.fn(),
    };
    app = express();
    app.use(bodyParser.json());
    app.use(businessNameRouterFactory(stubBusinessNameRepo));
  });

  afterAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("returns unavailable if similar names are returned", async () => {
    stubBusinessNameRepo.search.mockResolvedValue(["applebee's", "apple store"]);
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: "UNAVAILABLE",
      similarNames: ["applebee's", "apple store"],
    });
    expect(stubBusinessNameRepo.search).toHaveBeenCalledWith("apple bee's");
  });

  it("returns available if no similar names are returned", async () => {
    stubBusinessNameRepo.search.mockResolvedValue([]);
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      status: "AVAILABLE",
      similarNames: [],
    });
    expect(stubBusinessNameRepo.search).toHaveBeenCalledWith("apple bee's");
  });

  it("limits similar names to 10", async () => {
    stubBusinessNameRepo.search.mockResolvedValue(Array(11).fill("A"));
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(200);
    expect(response.body.similarNames).toHaveLength(10);
    expect(stubBusinessNameRepo.search).toHaveBeenCalledWith("apple bee's");
  });

  it("returns 500 if name search errors", async () => {
    stubBusinessNameRepo.search.mockRejectedValue({});
    const response = await request(app).get(`/business-name-availability?query=apple%20bee%27s`);
    expect(response.status).toEqual(500);
  });
});
